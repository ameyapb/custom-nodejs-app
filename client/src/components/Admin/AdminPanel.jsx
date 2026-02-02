import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";

export const AdminPanel = ({ token, userRole }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (userRole === "admin") {
      fetchUsers();
    }
  }, [userRole]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminAPI.getAllUsers(token);
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError("");
      const data = await adminAPI.updateUserRole(token, userId, newRole);
      // Update local state with new role
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, assigned_role: data.user.assigned_role }
            : user
        )
      );
      setSuccessMessage(`User role updated to ${newRole}`);
    } catch (err) {
      setError(err.message || "Failed to update user role");
    }
  };

  if (userRole !== "admin") {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-700 dark:text-yellow-400">
          ⚠️ Admin access required to view this panel
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="heading-secondary mb-6">User Management</h2>

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-4 mb-6 flex justify-between items-center">
          <p className="text-green-700 dark:text-green-300 font-medium">
            ✓ {successMessage}
          </p>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6 flex justify-between items-center">
          <p className="text-red-700 dark:text-red-300 font-medium">
            ⚠️ {error}
          </p>
          <button
            onClick={() => setError("")}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-3"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No users found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Current Role
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Change Role
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                    {user.email_address}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        user.assigned_role === "admin"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                          : user.assigned_role === "editor"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {user.assigned_role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {["viewer", "editor", "admin"].map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(user.id, role)}
                          disabled={user.assigned_role === role}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            user.assigned_role === role
                              ? "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
