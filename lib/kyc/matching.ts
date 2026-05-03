import { getCompanyNameCandidates, normalizeCompanyName, normalizeText } from "./normalize-text";

export function levenshteinDistance(left: string, right: string) {
  const a = normalizeText(left);
  const b = normalizeText(right);
  const rows = a.length + 1;
  const columns = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(columns).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let column = 0; column < columns; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

export function isExactCompanyNameMatch(left: string, right: string) {
  const leftCandidates = getCompanyNameCandidates(left);
  const rightCandidates = getCompanyNameCandidates(right);

  return leftCandidates.some((leftCandidate) => rightCandidates.includes(leftCandidate));
}

export function isNearExactCompanyNameMatch(left: string, right: string) {
  const leftCandidates = getCompanyNameCandidates(left);
  const rightCandidates = getCompanyNameCandidates(right);

  if (!leftCandidates.length || !rightCandidates.length) {
    return false;
  }

  return leftCandidates.some((leftCandidate) =>
    rightCandidates.some((rightCandidate) => {
      const minLength = Math.min(leftCandidate.length, rightCandidate.length);
      const distance = levenshteinDistance(leftCandidate, rightCandidate);

      if (minLength < 8) {
        return false;
      }

      return distance <= (minLength < 12 ? 1 : 2);
    }),
  );
}

export function extractDomain(value: string | undefined | null) {
  if (!value) {
    return "";
  }

  try {
    const withProtocol = value.startsWith("http") ? value : `https://${value}`;
    return new URL(withProtocol).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return normalizeText(value).replace(/\s+/g, "");
  }
}
