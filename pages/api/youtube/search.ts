import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";

export default async function search(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
