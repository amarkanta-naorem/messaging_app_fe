"use client";

import Image from "next/image";
import { API_BASE } from "@/lib/config";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Eye, Plus, SquarePen } from "lucide-react";
import { ContactDrawer } from "@/components/employee/contact-drawer";
import { Employee, formatDate } from "@/components/employee/utils";

export default function EmployeePage() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchEmployees = async () => {
      try {
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
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.phone.includes(searchQuery) ||
    (employee.email && employee.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-slate-500">Manage your organization's employees</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Plus size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Bio</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {employee.avatar ? (
                            <Image
                              src={employee.avatar}
                              alt={employee.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-slate-500 font-medium text-lg">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{employee.name}</p>
                          <p className="text-xs text-slate-500">
                            Joined: {formatDate(employee.joinedAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-slate-700">{employee.phone}</p>
                        {employee.email && (
                          <p className="text-slate-500 text-xs">{employee.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 truncate max-w-xs">
                        {employee.bio || <span className="text-slate-400 italic">No bio available</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewContact(employee.phone)}
                          className="p-2 rounded-lg text-slate-500 bg-slate-100/70 hover:bg-slate-200/70 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-white transition-all duration-150 cursor-pointer"
                          title="View Details"
                          aria-label={`View details for ${employee.name}`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 rounded-lg text-slate-500 bg-slate-100/70 hover:bg-slate-200/70 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white transition-all duration-150 cursor-pointer"
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
    </div>
  );
}
