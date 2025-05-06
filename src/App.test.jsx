import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";

describe("Section 1: Basic Form Functionality", () => {
  // Spy on console.log before each test to capture form submissions
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  // Restore console.log after each test
  afterEach(() => {
    console.log.mockRestore();
  });

  test("renders all form fields and submit button", () => {
    // Check that all form inputs and the submit button are present in the document
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
    // Fill out every form field with valid data and simulate submit
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

    // Expect console.log to be called with the correct form data object
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
    // Leave a required field blank and simulate submit, expect no console.log call
    render(<App />);
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(console.log).not.toHaveBeenCalled();
  });

  test("shows error for mismatched passwords and does not submit", async () => {
    // Fill form with mismatched password and confirmation, submit and check for error message
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
    // Provide invalid email format, submit, and verify error message is displayed
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
});

describe("Section 2: Validation and Error Handling", () => {
  // Spy on console.log before each test in this suite
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  // Restore console.log after each test
  afterEach(() => {
    console.log.mockRestore();
  });

  test("password length boundary: too short (<8) and exact boundary (8)", async () => {
    // First test a too-short password triggers an error, then test boundary length passes
    const { rerender } = render(<App />);
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

    // Reset form and test exact boundary password length
    rerender(<App />);
    console.log.mockClear();
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

  test("does not submit when confirm password is empty", async () => {
    // Leave confirm password blank, submit, expect mismatch error
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
    // confirmPassword left empty
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "01/01/2000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(console.log).not.toHaveBeenCalled();
    const confirmErr = await screen.findByText(/Passwords do not match/i);
    expect(confirmErr).toBeInTheDocument();
  });

  test("does not submit when email is empty", async () => {
    // Leave email blank, submit, expect invalid email error
    render(<App />);
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    // email left empty
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

  test("does not submit when last name is empty", async () => {
    // Leave last name blank, submit, and expect required-field error
    render(<App />);
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Alice" },
    });
    // lastName left empty
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "31/12/1999" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(console.log).not.toHaveBeenCalled();
    const lastErr = await screen.findByText(/Last Name is required/i);
    expect(lastErr).toBeInTheDocument();
  });
});

describe("Section 3: Additional Field Validations", () => {
  // Spy on console.log before tests to monitor submissions
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  // Restore console.log after tests
  afterEach(() => {
    console.log.mockRestore();
  });

  test("does not submit when date of birth is empty", async () => {
    // Submit with empty DOB and expect format error
    render(<App />);
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "User" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: "test@user.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    // dob left empty
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(console.log).not.toHaveBeenCalled();
    const dobErr = await screen.findByText(
      /Date of Birth must be in dd\/mm\/yyyy format/i
    );
    expect(dobErr).toBeInTheDocument();
  });

  test("does not submit when first name is empty", async () => {
    render(<App />);
    // first name empty
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "User" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: "test@user.com" },
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
    const err = await screen.findByText(/First Name is required/i);
    expect(err).toBeInTheDocument();
  });
  test("boundary DOB date (29/02 on non-leap vs leap year)", async () => {
    render(<App />);
    // fill required valid fields
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "User" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: "test@user.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });

    // non-leap year 29/02 should be rejected
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "29/02/2021" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(console.log).not.toHaveBeenCalled();
    const nonLeapErr = await screen.findByText(
      /Date of Birth must be in dd\/mm\/yyyy format/i
    );
    expect(nonLeapErr).toBeInTheDocument();

    // leap year 29/02 should be accepted
    fireEvent.change(screen.getByLabelText(/Date of Birth./i), {
      target: { value: "29/02/2024" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(console.log).toHaveBeenCalled();
  });
  test("accepts invalid characters in name fields.", async () => {
    render(<App />);
    // invalid chars in names
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "J@hn$%" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "%Doe!" },
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
    expect(console.log).toHaveBeenCalled();
  });
});
