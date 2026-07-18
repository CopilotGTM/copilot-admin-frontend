import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("admin user role management", () => {
  it("keeps app role visible in the user list and editable in the shared dialog", () => {
    const editDialog = readFileSync(
      join(
        process.cwd(),
        "src/components/organizations/dialogs/edit-user-dialog.tsx",
      ),
      "utf8",
    );
    const usersPage = readFileSync(
      join(process.cwd(), "src/app/(root)/users/page.tsx"),
      "utf8",
    );

    expect(editDialog).toContain('user_role: z.enum(["member", "admin"])');
    expect(editDialog).toContain("user_role: user.user_role");
    expect(editDialog).toContain('name="user_role"');
    expect(usersPage).toContain('header: "App Role"');
    expect(usersPage).toContain('key: "user_role"');
  });
});
