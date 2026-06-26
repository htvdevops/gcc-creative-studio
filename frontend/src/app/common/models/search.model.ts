/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type ImagenRequest = {
  prompt: string;
  generation_model: string;
  aspect_ratio: string;
  number_of_media: number;
  style?: string | null;
  negative_prompt: string | null;
  color_and_tone?: string | null;
  lighting?: string | null;
  composition?: string | null;
  add_watermark: boolean;
  upscale_factor?: '' | 'x2' | 'x3' | 'x4';
  source_asset_ids?: number[];
  source_media_items?: SourceMediaItemLink[];
  workspace_id?: number;
  use_brand_guidelines: boolean;
  enhance_prompt?: boolean;
  google_search?: boolean;
  resolution?: '1K' | '2K' | '4K';
  output_mime_type?: string;
  temperature?: number;
  max_output_tokens?: number;
  top_p?: number;
};

export type SourceMediaItemLink = {
  media_item_id: number;
  media_index: number;
  role: string;
};

export interface ReferenceImage {
  previewUrl: string;
  source_asset_id?: number;
  source_media_item?: SourceMediaItemLink;
  isNew?: boolean;
}

export interface ReferenceImageDto {
  asset_id: number;
  reference_type: 'ASSET' | 'STYLE';
}

export type VeoRequest = {
  prompt: string;
  generation_model: string;
  aspect_ratio: string;
  number_of_media?: number;
  style?: string | null;
  lighting?: string | null;
  color_and_tone?: string | null;
  composition?: string | null;
  negative_prompt: string;
  generate_audio: boolean;
  duration_seconds: number;
  start_image_asset_id?: number;
  end_image_asset_id?: number;
  source_video_asset_id?: number;
  source_media_items?: SourceMediaItemLink[];
  workspace_id?: number;
  use_brand_guidelines: boolean;
  enhance_prompt?: boolean;
  reference_images?: ReferenceImageDto[];
};

export type SearchResponse = {
  summary: any;
  results: SearchResult[];
  totalSize: number;
};

export type SearchResult = {
  document: Document;
};

export type Document = {
  derivedStructData: DocumentData;
};

export type DocumentData = {
  title: string;
  link: string;
  snippets: Snippet[];
  pagemap: PageMap;
};

export type Snippet = {
  snippet: string;
};

export type PageMap = {
  cse_image: ImagesData[];
};

export type ImagesData = {
  src: string;
};

export interface GallerySearchDto {
  limit: number;
  offset?: number;
  startAfter?: string;
  userEmail?: string;
  mimeType?: string;
  model?: string;
  status?: string;
  workspaceId?: number;
  includeDeleted?: boolean;
  startDate?: string;
  endDate?: string;
  itemType?: string;
  query?: string;
  tags?: string[];
}
