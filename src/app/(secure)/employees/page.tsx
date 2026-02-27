"use client";

import Image from "next/image";
import { API_BASE } from "@/lib/config";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Eye, Plus, SquarePen } from "lucide-react";
import { ContactDrawer } from "@/components/employee/contact-drawer";
import { AddEmployeeDrawer } from "@/components/employee/add-employee-drawer";
import { Employee, formatDate } from "@/components/employee/utils";

export default function EmployeePage() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/contacts/organization`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchEmployees();
  }, [token]);

  const handleViewContact = (phone: string) => {
    setSelectedPhone(phone);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedPhone(null);
  };

  const filteredEmployees = employees.filter((employee) =>
    (employee.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (employee.phone || "").includes(searchQuery) ||
    (employee.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Employees</h1>
          <p className="text-(--text-secondary)">Manage your organization's employees</p>
        </div>
        <button
          onClick={() => setIsAddEmployeeOpen(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="bg-(--bg-card) theme-bg-card rounded-xl border border-(--border-primary) shadow-sm overflow-hidden">
        <div className="p-4 border-b border-(--border-primary) bg-(--bg-secondary)">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={20} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-(--border-secondary) focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-(--bg-input) text-(--text-primary) placeholder:text-(--text-muted)"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-(--text-secondary)">
            <thead className="bg-(--bg-secondary) text-(--text-primary) font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Bio</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-primary)">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-(--text-muted)">
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-(--text-muted)">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="group hover:bg-(--bg-hover) transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-(--bg-tertiary) flex items-center justify-center overflow-hidden shrink-0">
                          {employee.avatar ? (
                            <Image
                              src={employee.avatar}
                              alt={employee.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-(--text-muted) font-medium text-lg">
                              {employee.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-(--text-primary) font-medium">{employee.name}</p>
                          <p className="text-xs text-(--text-muted)">
                            Joined: {formatDate(employee.joinedAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-(--text-primary)">{employee.phone}</p>
                        {employee.email && (
                          <p className="text-(--text-muted) text-xs">{employee.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-(--text-secondary) truncate max-w-xs">
                        {employee.bio || <span className="text-(--text-muted) italic">No bio available</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewContact(employee.phone)}
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-(--accent-primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--accent-primary) focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="View Details"
                          aria-label={`View details for ${employee.name}`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 rounded-lg text-(--text-muted) bg-(--bg-tertiary)/70 hover:bg-(--bg-hover) hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-(--bg-card) transition-all duration-150 cursor-pointer"
                          title="Edit"
                          aria-label={`Edit ${employee.name}`}
                        >
                          <SquarePen size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContactDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        phone={selectedPhone}
      />

      <AddEmployeeDrawer
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        onEmployeeAdded={() => {
          fetchEmployees();
        }}
      />
    </div>
  );
}
