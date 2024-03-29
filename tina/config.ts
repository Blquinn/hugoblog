import slugify from "slugify";
import { Form, TinaCMS, defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

function dateToDateString(date: Date): string {
  return date.toISOString().substring(0, 10)
}

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "static",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "static",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        defaultItem() {
          return {
            title: '',
            author: 'Benjamin Quinn',
            draft: true,
          };
        },
        ui: {
          filename: {
            slugify: (values) => slugify(values.title, { lower: true }),
          },
          beforeSubmit: async ({
            form,
            values,
          }: {
            form: Form
            cms: TinaCMS
            values: Record<string, any>
          }) => {
            let vals: Record<string, any> = {
              ...values,
              lastmod: dateToDateString(new Date())
            }

            if (form.crudType == 'create') {
              vals.date = dateToDateString(new Date())
            }

            return vals
          },
        },
        fields: [
          {
            name: "draft",
            type: "boolean",
            label: "In Draft",
            description: "Disabling 'In Draft' publishes the post.",
            required: true,
          },
          {
            name: "title",
            type: "string",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            name: "slug",
            type: "string",
            label: "URL Slug",
            required: false,
            description: "This is the url's path. It will default to the title of the post. E.g. in /posts/my-post 'my-post' is the slug.",
          },
          {
            name: "author",
            type: "string",
            label: "Author Name",
            required: false,
            description: "The author of the article.",
          },
          {
            name: "description",
            type: "string",
            label: "Description",
            required: false,
          },
          {
            name: "date",
            type: "datetime",
            label: "Creation Date",
            description: "The datetime assigned to this page.",
          },
          {
            name: "lastmod",
            type: "datetime",
            label: "Last Modification Date",
            description: "The datetime at which the content was last modified.",
          },
          {
            name: "categories",
            type: "string",
            label: "Categories",
            required: false,
            list: true,
          },
          {
            name: "tags",
            type: "string",
            label: "Tags",
            required: false,
            list: true,
          },
          {
            name: "aliases",
            type: "string",
            label: "Aliases",
            description: "An array of one or more aliases (e.g., old published paths of renamed content) that will be created in the output directory structure.",
            required: false,
            list: true,
          },
          {
            name: "body",
            type: "rich-text",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
