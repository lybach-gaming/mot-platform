import { IQuizz } from '../../../core/database/schemas';

export interface IListQuizItemResponse extends IQuizz {
  slug_category: string;
  slug_subcategory: string;
  slug_subcategory_level: string;
  no_of_que: number;
  is_played: boolean;
  thumb_image: string;
  share_url: string;
}
