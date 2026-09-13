import { useEffect, useState } from "react";

import {
  changePassword,
  getProfile,
  updateProfile,
} from "../api/authApi";

const Profile = () => {
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currency: "NGN",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] =
    useState(false);
  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");
  const [profileError, setProfileError] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");
  const [passwordError, setPasswordError] =
    useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();

        setProfileForm({
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          currency: response.user.currency,
        });
      } catch (error) {
        setProfileError(
          error.message || "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setProfileError("");
    setProfileMessage("");
    setProfileSaving(true);

    try {
      const response = await updateProfile(
        profileForm
      );

      setProfileMessage(response.message);
    } catch (error) {
      setProfileError(
        error.message || "Unable to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New password and confirmation do not match."
      );
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await changePassword({
        currentPassword:
          passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordMessage(response.message);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(
        error.message ||
          "Unable to change password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Profile
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Manage your personal information,
          currency preference and password.
        </p>
      </div>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">
          Personal Information
        </h2>

        <form
          onSubmit={handleProfileSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium"
            >
              First name
            </label>

            <input
              id="firstName"
              name="firstName"
              type="text"
              value={profileForm.firstName}
              onChange={handleProfileChange}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium"
            >
              Last name
            </label>

            <input
              id="lastName"
              name="lastName"
              type="text"
              value={profileForm.lastName}
              onChange={handleProfileChange}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium"
            >
              Currency
            </label>

            <select
              id="currency"
              name="currency"
              value={profileForm.currency}
              onChange={handleProfileChange}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            >
              <option value="NGN">
                Nigerian Naira (NGN)
              </option>

              <option value="USD">
                US Dollar (USD)
              </option>

              <option value="GBP">
                British Pound (GBP)
              </option>

              <option value="EUR">
                Euro (EUR)
              </option>
            </select>
          </div>

          {profileError && (
            <p className="text-sm text-red-600">
              {profileError}
            </p>
          )}

          {profileMessage && (
            <p className="text-sm text-green-600">
              {profileMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={profileSaving}
            className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {profileSaving
              ? "Saving..."
              : "Save Profile"}
          </button>
        </form>
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">
          Change Password
        </h2>

        <form
          onSubmit={handlePasswordSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium"
            >
              Current password
            </label>

            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium"
            >
              New password
            </label>

            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              minLength={8}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium"
            >
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              minLength={8}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>

          {passwordError && (
            <p className="text-sm text-red-600">
              {passwordError}
            </p>
          )}

          {passwordMessage && (
            <p className="text-sm text-green-600">
              {passwordMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordSaving}
            className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {passwordSaving
              ? "Changing..."
              : "Change Password"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Profile;