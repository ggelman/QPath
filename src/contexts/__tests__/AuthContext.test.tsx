import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { AuthProvider } from "../AuthContext";
import { useAuth } from "@/hooks/useAuth";

const {
  loginMock,
  registerMock,
  logoutMock,
  refreshSessionMock,
  getCurrentUserMock,
  clearTokensMock,
} = vi.hoisted(() => ({
  loginMock: vi.fn(),
  registerMock: vi.fn(),
  logoutMock: vi.fn(),
  refreshSessionMock: vi.fn(),
  getCurrentUserMock: vi.fn(),
  clearTokensMock: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  apiService: {
    login: loginMock,
    register: registerMock,
    logout: logoutMock,
    refreshSession: refreshSessionMock,
    getCurrentUser: getCurrentUserMock,
    clearTokens: clearTokensMock,
  },
  ApiError: class ApiError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  },
}));

function AuthConsumer() {
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await login("testuser", "secret-password");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <span data-testid="auth-state">{isAuthenticated ? "authenticated" : "anonymous"}</span>
      <span data-testid="loading-state">{isLoading ? "loading" : "idle"}</span>
      <span data-testid="user-name">{user?.full_name ?? "no-user"}</span>
      <button onClick={handleLogin}>login</button>
      {error ? <p data-testid="error-message">{error}</p> : null}
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getCurrentUserMock.mockResolvedValue(null);
  });

  it("logs in the user and updates context state", async () => {
    loginMock.mockResolvedValueOnce({
      access_token: "access-token",
      refresh_token: "refresh-token",
      token_type: "bearer",
      user: {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        full_name: "Test User",
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // Wait for initialization to finish
    await waitFor(() => expect(screen.getByTestId("loading-state")).toHaveTextContent("idle"));

    await userEvent.click(screen.getByText("login"));

    expect(loginMock).toHaveBeenCalledWith("testuser", "secret-password");

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
  });

  it("surface login errors to the caller", async () => {
    loginMock.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading-state")).toHaveTextContent("idle"));

    await userEvent.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByTestId("error-message")).toHaveTextContent("Invalid credentials"));
    expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
  });
});
