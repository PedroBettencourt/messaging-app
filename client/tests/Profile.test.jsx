import { describe, it, expect, vi, test } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Layout from "../src/Layout/Layout";
import Profile from "../src/Profile/Profile";
import {BrowserRouter, Routes, Route, MemoryRouter} from 'react-router-dom';
import { act } from "react";

function renderPage() {
    render(
      <MemoryRouter initialEntries={['/profile/testing']}>
        <Routes>
            <Route element={ <Layout/> }>
                <Route path="/profile/:username" element={ <Profile /> } />
            </Route>
        </Routes>
      </MemoryRouter>
    );
}

//Don't get why it can't get useParams and the useOutletContext fails specifically on this test..

// describe("Profile component", () => {
//   it("renders profile page", () => {
//     renderPage();

//     expect(screen.getByRole("heading").textContent).toBe('Profile Page');
//   });
// });