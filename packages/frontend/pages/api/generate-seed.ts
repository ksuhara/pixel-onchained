// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { decode } from "node-libpng";

import { PNGCollectionEncoder, buildSVG } from "../../lib";

type Data = {
  rle: string;
  svg: string;
  hexColors: string[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const encoder = new PNGCollectionEncoder();
  const buff = Buffer.from(req.body.file.split(",")[1], "base64");
  const image = decode(buff);
  const { rle, hexColors } = encoder.encodeImage("", image);
  console.log(hexColors, "hexColors");
  const svg = buildSVG([{ data: rle }], hexColors);
  res.status(200).json({
    rle,
    svg,
    hexColors,
  });
}
