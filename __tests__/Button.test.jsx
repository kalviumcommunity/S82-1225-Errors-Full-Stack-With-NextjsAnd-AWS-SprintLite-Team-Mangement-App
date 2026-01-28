/**
 * Unit test for Button component
 * Tests rendering and user interactions
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/Button";

describe("Button component", () => {
  test("renders button with children text", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByText("Click Me");
    expect(button).toBeInTheDocument();
  });

  test("button renders correctly with different variants", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText("Primary")).toHaveClass("bg-blue-600");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText("Secondary")).toHaveClass("bg-gray-800");

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText("Danger")).toHaveClass("bg-red-900");
  });

  test("button renders with different sizes", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText("Small")).toHaveClass("text-sm");

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByText("Medium")).toHaveClass("px-4");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText("Large")).toHaveClass("text-lg");
  });

  test("button can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
  });

  test("button triggers onClick handler when clicked", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click</Button>);
    const button = screen.getByText("Click");

    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("disabled button does not trigger onClick", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );
    const button = screen.getByText("Disabled");

    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
