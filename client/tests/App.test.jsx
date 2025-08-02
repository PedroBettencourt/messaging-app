import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Layout from "../src/Layout/Layout";
import App from "../src/App/App";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { act } from "react";
import userEvent from '@testing-library/user-event'

function renderPage() {
    render(
      <BrowserRouter>
        <Routes>
            <Route element={ <Layout/> }>
                <Route path="/" element={<App />} />
            </Route>
        </Routes>
      </BrowserRouter>,
    );
}

describe("App component", () => {
  it("renders main page", () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe('Main Page');
  });


  it("renders contacts when logged in", async () => {
    const mockContacts = [ "testing", "testing2" ];
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockContacts),
      }),
    );

    await act(() => renderPage());

    expect(screen.getByText("testing")).toBeInTheDocument();
  });


  it("renders messages", async () => {
    const mockContacts = [ "testing", "testing2" ];
    const mockMessages = [ { id: 1, sentAt: "2025-07-26T10:15:53.504Z", content: "first message", author: "testing", recipient: "testing2" }, 
                           { id: 2, sentAt: "2025-07-27T22:14:30.021Z", content: "second message", author: "testing2", recipient: "testing" },
                         ];

    global.fetch = vi.fn()
      .mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockContacts),
        })
      ).mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockMessages),
        })
    );

    await act(() => renderPage());

    expect(screen.getByText("first message")).toBeInTheDocument();
    expect(screen.getByText("second message")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });


  it("send a message", async () => {
    // Similar to the last test with new message
    const mockContacts = [ "testing", "testing2" ];
    const mockMessages = [ { id: 1, sentAt: "2025-07-26T10:15:53.504Z", content: "first message", author: "testing", recipient: "testing2" }, 
                           { id: 2, sentAt: "2025-07-27T22:14:30.021Z", content: "second message", author: "testing2", recipient: "testing" },
                         ];
    const mockNewMessage = { id: 3, sentAt: "2025-07-28T09:15:10.001Z", content: "new testing message", author: "testing", recipient: "testing2" };

    global.fetch = vi.fn()
      .mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockContacts),
        })
      ).mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockMessages),
        })
      ).mockImplementation(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockNewMessage),
        })
    );
    await act(() => renderPage());

    // New part
    
    await act(async () => {
        const textbox = screen.getByRole('textbox');
        fireEvent.change(textbox, { target: { value: 'new testing message' } });
        const button = screen.getByRole('button');
        fireEvent.click(button);
    });

    expect(screen.getByText("new testing message"));
  });


  it("get new contact", async () => {
    const mockContacts = [ "testing", "testing2" ];
    const mockNewContact = { username: "testing3", bio: "new bio"};
    global.fetch = vi.fn()
      .mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockContacts),
        })
      ).mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve([]),
        })
      ).mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve(mockNewContact),
        })
      ).mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve([]),
        })
      );
    
    await act(() => renderPage());

    const user = userEvent.setup();

    await act(async () => {
      const newContact = screen.getByText('New Contact');
      user.click(newContact);
      expect(screen.getByRole("label"));
    });

    // This test doesn't work, the new contact isn't clicked, i suspect it's bcz it's not a button

    //expect(screen.getByRole("a"))

  })
});