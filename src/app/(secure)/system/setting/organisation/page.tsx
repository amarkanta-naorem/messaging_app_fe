"use client";

import { useState } from "react";
import { OrganisationForm } from "@/features/organisations/OrganisationForm";
import { updateActiveOrganisation, type OrganisationUpdatePayload } from "@/services/organisation.service";
import { store } from "@/store/index";
import { setGlobalError } from "@/store/slices/errorSlice";

export default function OrganisationPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload: OrganisationUpdatePayload) => {
    try {
      setLoading(true);
      await updateActiveOrganisation(payload);
      store.dispatch(setGlobalError({ message: "Organisation updated successfully", type: "success" }));
    } catch (error) {
      console.error("Failed to update organisation:", error);
      const message = error instanceof Error ? error.message : "Failed to update organisation";
      store.dispatch(setGlobalError({ message, type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  return <OrganisationForm onSubmit={handleSubmit} loading={loading} />;
}
