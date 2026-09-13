import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import apiClient from "../api/apiClient";

import {
  updateProfile,
} from "../api/authApi";

vi.mock("../api/apiClient", () => ({
  default: vi.fn(),
}));

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("stores the updated user after a successful profile update", async () => {
    const updatedUser = {
      id: "test-user-id",
      firstName: "Joe",
      lastName: "Doe",
      email: "joe@example.com",
      currency: "USD",
    };

    apiClient.mockResolvedValue({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });

    await updateProfile({
      firstName: "Joe",
      lastName: "Doe",
      email: "joe@example.com",
      currency: "USD",
    });

    expect(apiClient).toHaveBeenCalledWith(
      "/auth/profile",
      {
        method: "PUT",
        body: JSON.stringify({
          firstName: "Joe",
          lastName: "Doe",
          email: "joe@example.com",
          currency: "USD",
        }),
      }
    );

    expect(
      JSON.parse(localStorage.getItem("user"))
    ).toEqual(updatedUser);
  });
});