"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";

export default function UserMasterAlert({ created, error }) {
  useEffect(() => {
    if (created) {
      Swal.fire({
        icon: "success",
        title: "User created",
        text: "The new user has been added successfully.",
        confirmButtonColor: "#2563eb",
      });
    }

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Unable to save user",
        text: error,
        confirmButtonColor: "#2563eb",
      });
    }
  }, [created, error]);

  return null;
}
