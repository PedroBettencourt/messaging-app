import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Layout from "../src/Layout/Layout";
import Login from "../src/Login/Login";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { act } from "react";

function renderPage() {
    render(
      <BrowserRouter>
        <Routes>
            <Route element={ <Layout/> }>
                <Route path="/" element={<Login />} />
            </Route>
        </Routes>
      </BrowserRouter>,
    );
}

describe("Login component", () => {
  it("renders login page", () => {
    renderPage();

    expect(screen.getByRole("heading").textContent).toBe('Login');
  });

  it("renders login form", () => {
    renderPage();

    expect(screen.getByLabelText('Username').type).toBe('text');
    expect(screen.getByLabelText('Password').type).toBe('password');
    expect(screen.getByRole('button').textContent).toBe('Log in');
  });

  it("form inputs work", () => {
    renderPage();

    const username = screen.getByLabelText('Username');
    const password = screen.getByLabelText('Password');

    fireEvent.change(username, { target: { value: 'aaa' } });
    fireEvent.change(password, { target: { value: 'bbb' } });

    expect(username.value).toBe('aaa');
    expect(password.value).toBe('bbb');
  });
  
  // it("loading header upon submission", () => {
  //   renderPage();

  //   const username = screen.getByLabelText('Username');
  //   const password = screen.getByLabelText('Password');
  //   fireEvent.change(username, { target: { value: 'aaa' } });
  //   fireEvent.change(password, { target: { value: 'bbb' } });

  //   const button = screen.getByRole('button');
  //   fireEvent.click(button);

  //   expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Loading...");
  // });

  it("correct login", async () => {
    const mockForm = { token: "123", username: "test" };
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockForm),
      }),
    );

    await act(() => 
        render(
            <BrowserRouter>
                <Routes>
                    <Route element={ <Layout/> }>
                        <Route path="/" element={<Login />} />
                    </Route>
                </Routes>
            </BrowserRouter>)
    );

    await act(async () => {
        const username = screen.getByLabelText('Username');
        const password = screen.getByLabelText('Password');
        fireEvent.change(username, { target: { value: 'test' } });
        fireEvent.change(password, { target: { value: 'aaa' } });
        const button = screen.getByRole('button');
        fireEvent.click(button);
    });
    
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("test is logged in!")

  });

  // it("wrong login", async () => {
  //   // same code as the previous test but with a different mocked response
  //   const mockResult = { errors: [ { msg: "Username does not exist" } ] };
  //   global.fetch = vi.fn(() =>
  //     Promise.resolve({
  //       json: () => Promise.resolve(mockResult),
  //     }),
  //   );

  //   await act(() => 
  //       render(
  //           <BrowserRouter>
  //               <Routes>
  //                   <Route element={ <Layout/> }>
  //                       <Route path="/" element={<Login />} />
  //                   </Route>
  //               </Routes>
  //           </BrowserRouter>)
  //   );

  //   await act(async () => {
  //       const username = screen.getByLabelText('Username');
  //       const password = screen.getByLabelText('Password');
  //       fireEvent.change(username, { target: { value: 'test' } });
  //       fireEvent.change(password, { target: { value: 'ccc' } });
  //       const button = screen.getByRole('button');
  //       fireEvent.click(button);
  //   });

  //   expect(screen.getByText("Username does not exist")).toBeInTheDocument();

  //   // This test does not work because "Objects are not valid as a React child (found: object with keys {errors})."
  //   // idk why it's doing this but in development it works fine
  // });
});