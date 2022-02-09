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
  if (image.height != 32 || image.width != 32) {
    throw new Error("Must be 32*32 png");
  }
  const { rle, hexColors } = encoder.encodeImage("", image);
  if (hexColors.length > 256) {
    throw new Error("Color must be less than 256");
  }
  const svg = buildSVG([{ data: rle }], hexColors);
  res.status(200).json({
    rle,
    svg,
    hexColors,
  });
}
