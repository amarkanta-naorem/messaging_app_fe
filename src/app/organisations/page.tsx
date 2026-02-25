"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  Organisation,
  OrganisationPayload,
  OrganisationStatus,
  ValidationErrorItem,
  createOrganisation,
  getOrganisation,
  getOrganisations,
} from "@/lib/organisations";

interface OrganisationFormState {
  name: string;
  logo: string;
  bio: string;
  status: OrganisationStatus;
}

const statusOptions: OrganisationStatus[] = ["active", "suspended", "deleted"];

const emptyFormState: OrganisationFormState = {
  name: "",
  logo: "",
  bio: "",
  status: "active",
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const mapApiErrors = (errors?: ValidationErrorItem[]) => {
  if (!errors) return {} as Record<string, string>;
  return errors.reduce((acc, item) => {
    acc[item.path] = item.message;
    return acc;
  }, {} as Record<string, string>);
};

const buildPayload = (state: OrganisationFormState): OrganisationPayload => ({
  name: state.name.trim(),
  logo: state.logo.trim() ? state.logo.trim() : null,
  bio: state.bio.trim() ? state.bio.trim() : null,
  status: state.status,
});

const validateOrganisation = (state: OrganisationFormState, requireName: boolean) => {
  const errors: Record<string, string> = {};
  const trimmedName = state.name.trim();
  const trimmedLogo = state.logo.trim();
  const trimmedBio = state.bio.trim();

  if (requireName && !trimmedName) {
    errors.name = "Name is required.";
  } else if (trimmedName && trimmedName.length > 100) {
    errors.name = "Name must be 1-100 characters.";
  }

  if (trimmedLogo && trimmedLogo.length > 255) {
    errors.logo = "Logo URL must be 255 characters or less.";
  }

  if (trimmedBio && trimmedBio.length > 150) {
    errors.bio = "Bio must be 150 characters or less.";
  }

  if (!statusOptions.includes(state.status)) {
    errors.status = "Status must be active, suspended, or deleted.";
  }

  return errors;
};

export default function OrganisationsPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState<Organisation | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [createState, setCreateState] = useState<OrganisationFormState>(emptyFormState);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [createNotice, setCreateNotice] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const handleUnauthorized = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  const loadOrganisations = useCallback(
    async (requestedPage = page) => {
      setListLoading(true);
      setListError(null);
      try {
        const data = await getOrganisations(requestedPage, limit);
        setOrganisations(data.data);
        setTotal(data.pagination.total);
        setPage(data.pagination.page);
        if (data.data.length === 0) {
          setSelectedOrganisation(null);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          handleUnauthorized();
          return;
        }
        setListError(err instanceof Error ? err.message : "Failed to load organisations.");
      } finally {
        setListLoading(false);
      }
    },
    [handleUnauthorized, limit, page]
  );

  const loadOrganisation = useCallback(
    async (organisationId: number) => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const data = await getOrganisation(organisationId);
        setSelectedOrganisation(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          handleUnauthorized();
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          setDetailError("Organisation not found. It may have been removed.");
          setSelectedOrganisation(null);
          loadOrganisations(page);
          return;
        }
        setDetailError(err instanceof Error ? err.message : "Failed to load organisation.");
      } finally {
        setDetailLoading(false);
      }
    },
    [handleUnauthorized, loadOrganisations, page]
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    if (user) {
      loadOrganisations(page);
    }
  }, [loadOrganisations, page, user]);

  const handleSelectOrganisation = async (organisation: Organisation) => {
    setSelectedOrganisation(organisation);
    setDetailError(null);
    await loadOrganisation(organisation.id);
  };

  const handleCreate = async () => {
    setCreateNotice(null);
    const errors = validateOrganisation(createState, true);
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setCreateLoading(true);
    setCreateErrors({});
    try {
      const created = await createOrganisation(buildPayload(createState));
      setCreateState(emptyFormState);
      setCreateNotice({ tone: "success", text: "Organisation created successfully." });
      await loadOrganisations(1);
      await loadOrganisation(created.id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleUnauthorized();
        return;
      }
      if (err instanceof ApiError && err.status === 400) {
        setCreateErrors(mapApiErrors(err.errors));
      }
      setCreateNotice({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to create organisation.",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Organisations</h1>
            <p className="text-sm text-slate-600">
              Manage the organisations where you are an active member.
            </p>
          </div>
          <Link href="/" className="text-sm text-green-700 hover:text-green-800">
            Back to chats
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1.85fr]">
          <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Create organisation</h2>
              <p className="text-sm text-slate-500">
                Use a short name and an optional logo or bio to help members recognise it.
              </p>
            </div>

            <div className="space-y-4">
              {createNotice && (
                <div
                  className={`text-sm rounded-lg px-3 py-2 border ${
                    createNotice.tone === "success"
                      ? "text-green-700 bg-green-50 border-green-100"
                      : "text-red-600 bg-red-50 border-red-100"
                  }`}
                >
                  {createNotice.text}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="org-name">
                  Name
                </label>
                <input
                  id="org-name"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={createState.name}
                  onChange={(event) => setCreateState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Acme Corp"
                />
                {createErrors.name && (
                  <p className="text-xs text-red-500">{createErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="org-logo">
                  Logo URL (optional)
                </label>
                <input
                  id="org-logo"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={createState.logo}
                  onChange={(event) => setCreateState((prev) => ({ ...prev, logo: event.target.value }))}
                  placeholder="https://cdn.example.com/logo.png"
                />
                {createErrors.logo && (
                  <p className="text-xs text-red-500">{createErrors.logo}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="org-bio">
                  Bio (optional)
                </label>
                <textarea
                  id="org-bio"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-20"
                  value={createState.bio}
                  onChange={(event) => setCreateState((prev) => ({ ...prev, bio: event.target.value }))}
                  placeholder="Short description"
                />
                {createErrors.bio && (
                  <p className="text-xs text-red-500">{createErrors.bio}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="org-status">
                  Status
                </label>
                <select
                  id="org-status"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={createState.status}
                  onChange={(event) =>
                    setCreateState((prev) => ({
                      ...prev,
                      status: event.target.value as OrganisationStatus,
                    }))
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {createErrors.status && (
                  <p className="text-xs text-red-500">{createErrors.status}</p>
                )}
              </div>

              <button
                type="button"
                className="w-full px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                disabled={createLoading}
                onClick={handleCreate}
              >
                {createLoading ? "Creating..." : "Create organisation"}
              </button>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {!selectedOrganisation ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 gap-3">
                <p className="text-sm">Select an organisation to view details.</p>
                <p className="text-xs">Details appear here once you pick one from the list.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{selectedOrganisation.name}</h2>
                    <p className="text-sm text-slate-500">Created {formatDate(selectedOrganisation.createdAt)}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                    {selectedOrganisation.status}
                  </span>
                </div>

                {detailError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {detailError}
                  </div>
                )}

                {detailLoading ? (
                  <p className="text-sm text-slate-500">Loading details...</p>
                ) : (
                  <div className="grid gap-4">
                    <div className="grid gap-1 text-sm text-slate-600">
                      <span className="text-xs uppercase tracking-wide text-slate-400">Name</span>
                      <span className="text-slate-900 font-medium">{selectedOrganisation.name}</span>
                    </div>
                    <div className="grid gap-1 text-sm text-slate-600">
                      <span className="text-xs uppercase tracking-wide text-slate-400">Logo</span>
                      {selectedOrganisation.logo ? (
                        <a
                          className="text-green-700 hover:text-green-800 break-all"
                          href={selectedOrganisation.logo}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {selectedOrganisation.logo}
                        </a>
                      ) : (
                        <span className="text-slate-400">Not set</span>
                      )}
                    </div>
                    <div className="grid gap-1 text-sm text-slate-600">
                      <span className="text-xs uppercase tracking-wide text-slate-400">Bio</span>
                      <span className="text-slate-700">
                        {selectedOrganisation.bio || "No bio provided."}
                      </span>
                    </div>
                    <div className="grid gap-1 text-sm text-slate-600">
                      <span className="text-xs uppercase tracking-wide text-slate-400">Status</span>
                      <span className="text-slate-700 capitalize">{selectedOrganisation.status}</span>
                    </div>
                    <Link
                      href="/dashboard"
                      className="inline-flex text-sm font-medium text-green-700 hover:text-green-800"
                    >
                      Manage in dashboard
                    </Link>
                  </div>
                )}

                <div className="grid gap-3 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Created at</span>
                    <span>{formatDate(selectedOrganisation.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Updated at</span>
                    <span>{formatDate(selectedOrganisation.updatedAt)}</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
