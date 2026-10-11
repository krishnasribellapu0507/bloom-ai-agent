import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { loadLearning, savePreferences, saveLearningItem, removeLearningItem, saveFeedback, saveLearningRun, loadAsset } from './forma-learning.server';
export type {LearningItem,LearningFeedback,LearningRun} from './forma-learning.server';
const str=z.string().trim();

export const loadLearningFn = createServerFn({method:'POST'}).handler(async()=>loadLearning());

export const savePreferencesFn = createServerFn({method:'POST'}).validator(z.object({preferences:str.max(3500)})).handler(async({data})=>savePreferences(data));

export const saveLearningItemFn = createServerFn({method:'POST'}).validator(z.object({
  kind:z.enum(['url','image','html']),title:str.min(1).max(100),url:z.string().url().max(1200).optional(),
  notes:str.max(3000).default(''),analysis:str.min(15).max(8500),
  base64:z.string().max(3300000).optional(),mime:z.enum(['image/png','image/jpeg','image/webp','text/html']).optional()
})).handler(async({data})=>saveLearningItem(data));

export const removeLearningItemFn = createServerFn({method:'POST'}).validator(z.object({id:z.string().uuid()})).handler(async({data})=>removeLearningItem(data));

export const saveFeedbackFn = createServerFn({method:'POST'}).validator(z.object({rating:z.union([z.literal(1),z.literal(-1)]),prompt:str.min(5).max(2400),correction:str.max(1600).default('')})).handler(async({data})=>saveFeedback(data));

export const saveLearningRunFn = createServerFn({method:'POST'}).validator(z.object({prompt:str.max(2400),score:z.number().int().min(0).max(100),critique:str.max(3500)})).handler(async({data})=>saveLearningRun(data));

export const loadAssetFn = createServerFn({method:'POST'}).validator(z.object({id:z.string().uuid()})).handler(async({data})=>loadAsset(data));

