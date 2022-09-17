import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";

enum HTTP_STATUS {
  BAD_REQUEST = 400,
  METHOD_NOT_ALLOWED = 405,
}

export default async function search(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED);
    return;
  }

  const { q } = req.query as { q: string };

  if (!q) {
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: "parameter 'q' is required" });
    return;
  }

  const key = process.env.YOUTUBE_API_KEY;
  const type = "video";
  const part = "snippet";
  const params = {
    key,
    part,
    q,
    type,
  };

  const { data } = await axios.get(SEARCH_ENDPOINT, { params });

  res.status(200).json(data);
}
