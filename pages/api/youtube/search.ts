import axios from "axios";
import { METHODS } from "http";
import { NextApiRequest, NextApiResponse } from "next";

const SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";

enum HTTP_STATUS {
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

  const key = process.env.YOUTUBE_API_KEY;
  const type = "video";
  const q = "hoge";
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
