import { Handler } from 'aws-lambda';
import { middleware } from '@libs/utils/handler';
import { listItems } from '@libs/services/dynamodb';
import { NotFoundException } from '@libs/errors/not-found';

const processHandler = async (event: any) => {
  const id = event.pathParameters.id;

  const posts = await listItems(
    process.env.POSTS_TABLE_NAME!,
    '#slug = :slug',
    { slug: id },
    `${process.env.ENV}-blog-posts-table-slug-index`,
    1
  );
  const post = posts.items.length > 0 ? posts.items[0] : null

  if (!post || post.state !== 'PUBLIC') {
    throw new NotFoundException('Item not found');
  }
  delete post.id;
  delete post.createdAt;
  delete post.createdBy;
  delete post.updatedAt;
  delete post.updatedBy;
  delete post.pk;

  return post;
}

export const handler: Handler = middleware(processHandler, 200);
