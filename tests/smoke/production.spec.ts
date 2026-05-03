import { expect, test } from "@playwright/test";

test.describe("production smoke", () => {
  test("home page renders in English and French", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "French Company KYC Pre-Check" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run pre-check" })).toBeVisible();
    await expect(page.getByRole("link", { name: /GitHub: Fred-Vu/ })).toHaveAttribute(
      "href",
      "https://github.com/fred-vu",
    );

    await page.getByRole("button", { name: "Français" }).click();
    await expect(page.getByRole("heading", { name: "Pré-contrôle KYC des entreprises françaises" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lancer le pré-contrôle" })).toBeVisible();
  });

  test("demo page and critical result page render expected report actions", async ({ page }) => {
    await page.goto("/demo");

    await expect(page.getByRole("heading", { name: "Demo companies" })).toBeVisible();
    await expect(page.getByText("Nova Capital Demo SAS")).toBeVisible();

    await page.goto("/check/100000025");

    await expect(page.getByText("Demo mode")).toBeVisible();
    await expect(page.locator("span").filter({ hasText: /^critical$/ }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate full PDF" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Print" })).toBeVisible();
    await expect(page.getByText("# French Company KYC Pre-Check Report")).toBeVisible();
  });

  test("live DG Tresor snapshot checks return expected sanction matches", async ({ request }) => {
    const association = await request.post("/api/precheck", {
      data: { identifier: "842191835", locale: "en" },
    });
    expect(association.ok()).toBeTruthy();

    const associationBody = await association.json();
    expect(associationBody.isDemo).toBe(false);
    expect(associationBody.company?.legalName).toBe("ASSOCIATION SCIENCES & EDUCATION");
    expect(associationBody.sourcesChecked).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceName: "DG_TRESOR_GELS",
          mode: "snapshot",
          status: "success",
        }),
      ]),
    );
    expect(associationBody.sanctionsMatches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          listName: "DG_TRESOR_GELS",
          rawRecord: expect.objectContaining({ idRegistre: 7097 }),
        }),
      ]),
    );

    const sodelim = await request.post("/api/precheck", {
      data: { identifier: "449292374", locale: "en" },
    });
    expect(sodelim.ok()).toBeTruthy();

    const sodelimBody = await sodelim.json();
    const ids = sodelimBody.sanctionsMatches
      .map((match: { rawRecord?: { idRegistre?: number } }) => match.rawRecord?.idRegistre)
      .filter(Boolean);

    expect(ids).toEqual(expect.arrayContaining([8310, 8311]));
  });
});
