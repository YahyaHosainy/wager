const BASE_URL = "https://storage.googleapis.com/wager-static-assets";
const BUCKETS = {
  organizations: "organization-images",
  teams: "team-images",
  profile: "profile-pictures",
  static: "site-static",
};

interface FromGCPArgs {
  bucket: string;
  path?: string;
  filename: string;
}
export default function (options: FromGCPArgs) {
  if (!options.path) {
    options.path = "/";
  }

  return `${BASE_URL}/${BUCKETS[options.bucket] || options.bucket}${
    options.path
  }${options.filename}`;
}
