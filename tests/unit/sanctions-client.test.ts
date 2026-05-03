import { describe, expect, it } from "vitest";
import { parseSanctionsPublication, screenSanctions } from "@/lib/clients/sanctions-client";
import { isExactCompanyNameMatch } from "@/lib/kyc/matching";

describe("DG Tresor sanctions client", () => {
  it("parses official publication details and aliases", () => {
    const records = parseSanctionsPublication({
      Publications: {
        DatePublication: "2026-04-30T09:49:26.2164665+02:00",
        PublicationDetail: [
          {
            IdRegistre: 123,
            Nature: "Personne morale",
            Nom: "EXAMPLE ENTITY",
            RegistreDetail: [
              {
                TypeChamp: "ALIAS",
                Valeur: [{ Alias: "EXAMPLE TRADING", Commentaire: "" }],
              },
            ],
          },
        ],
      },
    });

    expect(records).toEqual([
      expect.objectContaining({
        name: "EXAMPLE ENTITY",
        nature: "Personne morale",
        aliases: ["EXAMPLE TRADING"],
        identifiers: [],
      }),
    ]);
  });

  it("extracts SIREN and SIRET-like identifiers from official identification fields", () => {
    const records = parseSanctionsPublication({
      Publications: {
        DatePublication: "2026-04-30T09:49:26.2164665+02:00",
        PublicationDetail: [
          {
            IdRegistre: 8310,
            Nature: "Personne morale",
            Nom: "SODELIM",
            RegistreDetail: [
              {
                TypeChamp: "IDENTIFICATION",
                Valeur: [
                  {
                    Identification: "SIRET 4492923740039",
                    Commentaire: "immatriculee au RCS sous le numero SIRET 4492923740039",
                  },
                ],
              },
            ],
          },
          {
            IdRegistre: 7463,
            Nature: "Personne morale",
            Nom: "association « JONAS PARIS »",
            RegistreDetail: [
              {
                TypeChamp: "IDENTIFICATION",
                Valeur: [
                  {
                    Identification: "W751252965",
                    Commentaire: "numero SIREN 889271375",
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    expect(records[0].identifiers).toEqual(
      expect.arrayContaining(["4492923740039", "449292374"]),
    );
    expect(records[1].identifiers).toEqual(expect.arrayContaining(["889271375"]));
  });

  it("supports the Association Sciences et education DG Tresor regression case", () => {
    const records = parseSanctionsPublication({
      Publications: {
        DatePublication: "2026-04-30T09:49:26.2164665+02:00",
        PublicationDetail: [
          {
            IdRegistre: 7097,
            Nature: "Personne morale",
            Nom: "Association Sciences et éducation",
            RegistreDetail: [
              {
                TypeChamp: "IDENTIFICATION",
                Valeur: [
                  {
                    Identification: "W9220127754",
                    Commentaire: "Creee le 27 juillet 2018",
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    expect(records[0].name).toBe("Association Sciences et éducation");
    expect(
      isExactCompanyNameMatch("ASSOCIATION SCIENCES & EDUCATION", records[0].name),
    ).toBe(true);
  });

  it("screens Association Sciences et education from the local snapshot by normalized name", async () => {
    const result = await screenSanctions({
      companyName: "ASSOCIATION SCIENCES & EDUCATION",
      identifiers: ["842191835"],
    });

    expect(result.source.mode).toBe("snapshot");
    expect(result.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          listName: "DG_TRESOR_GELS",
          matchedValue: "Association Sciences et éducation",
        }),
      ]),
    );
    expect(
      result.matches.some((match) => {
        const record = match.rawRecord as { idRegistre?: number };
        return record.idRegistre === 7097;
      }),
    ).toBe(true);
  });

  it("screens shared SIREN cases from the local snapshot without person-name false positives", async () => {
    const result = await screenSanctions({
      companyName: "SODELIM",
      identifiers: ["449292374"],
    });

    const ids = result.matches.map((match) => (match.rawRecord as { idRegistre?: number }).idRegistre);

    expect(ids).toEqual(expect.arrayContaining([8310, 8311]));
    expect(ids).not.toContain(1832);
    expect(result.matches.every((match) => match.listName === "DG_TRESOR_GELS")).toBe(true);
  });

  it("screens Smart Pegasus and Jonas Paris from the local snapshot", async () => {
    const smartPegasus = await screenSanctions({
      companyName: "Smart Pegasus",
      identifiers: [],
    });
    const jonasParis = await screenSanctions({
      companyName: "JONAS PARIS",
      identifiers: ["889271375"],
    });

    expect(
      smartPegasus.matches.some((match) => {
        const record = match.rawRecord as { idRegistre?: number };
        return record.idRegistre === 1832;
      }),
    ).toBe(true);
    expect(
      jonasParis.matches.some((match) => {
        const record = match.rawRecord as { idRegistre?: number };
        return record.idRegistre === 7463;
      }),
    ).toBe(true);
  });
});
