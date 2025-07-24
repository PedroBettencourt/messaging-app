import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Layout from "../src/Layout/Layout";
import {BrowserRouter} from 'react-router-dom';

describe("Layout component", () => {
  it("renders homepage link", () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>,
    );

    expect(screen.getByRole("link", { name: "Messages" })).toHaveAttribute('href', '/');
  });

  it("renders login link", () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>,
    );

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute('href', '/login');
  });

  // it("renders profile page when user has correct token", () => {
  //   render(
  //     <BrowserRouter>
  //       <Layout />
  //     </BrowserRouter>
  //   );

  //   // Probably do this in login

  // })
});