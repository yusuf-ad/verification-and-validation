import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";

describe("Create New Account Form", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test("renders all form fields and submit button", () => {
    render(<App />);
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("submits form when all fields are filled", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "01/01/2000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(console.log).toHaveBeenCalledWith({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
      dob: "01/01/2000",
    });
  });

  test("does not submit when a required field is empty", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(console.log).not.toHaveBeenCalled();
  });

  test("shows error for mismatched passwords and does not submit", async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Smith" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "pass1" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "pass2" },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "31/12/1999" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(console.log).not.toHaveBeenCalled();
    const err = await screen.findByText(/Passwords do not match/i);
    expect(err).toBeInTheDocument();
  });

  test("shows error for invalid email and does not submit", async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: "janeexample.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "01/01/2000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(console.log).not.toHaveBeenCalled();
    const emailErr = await screen.findByText(/Invalid email format/i);
    expect(emailErr).toBeInTheDocument();
  });

  test("password length boundary: too short (<8) and exact boundary (8)", async () => {
    render(<App />);
    // Test too short password
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "short1" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "short1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(console.log).not.toHaveBeenCalled();
    const pwErr = await screen.findByText(
      /Password must be at least 8 characters/i
    );
    expect(pwErr).toBeInTheDocument();

    // Clear and test exact boundary password length
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "12345678" },
    });
    // Fill other required valid fields
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "User" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: "test@user.com" },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "02/02/2002" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(
      screen.queryByText(/Password must be at least 8 characters/i)
    ).toBeNull();
    expect(console.log).toHaveBeenCalled();
  });

  test("invalid DOB formats are rejected", async () => {
    render(<App />);
    // Test missing leading zero
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "1/1/2000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(console.log).not.toHaveBeenCalled();
    const dobErr1 = await screen.findByText(
      /Date of Birth must be in dd\/mm\/yyyy format/i
    );
    expect(dobErr1).toBeInTheDocument();

    // Test wrong delimiter
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "01-01-2000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    const dobErr2 = await screen.findByText(
      /Date of Birth must be in dd\/mm\/yyyy format/i
    );
    expect(dobErr2).toBeInTheDocument();
  });
});
