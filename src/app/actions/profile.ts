"use server";

export type ProfileState = {
  success?: boolean;
  message?: string;
  error?: string;
};

export async function updateProfileAction(
  _prev: ProfileState | undefined,
  formData: FormData
): Promise<ProfileState> {
  const fullName = formData.get("fullName")?.toString();
  const collegeName = formData.get("collegeName")?.toString();
  const email = formData.get("email")?.toString();

  if (!fullName || !collegeName || !email) {
    return { error: "Please fill in all required profile fields." };
  }

  return {
    success: true,
    message: "Profile & institution details updated successfully!",
  };
}
