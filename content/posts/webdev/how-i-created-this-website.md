---
draft: false
title: How I Created This Website
author: Benjamin Quinn
description: This post explains what technologies and techniques I use to create my blog.
date: 2023-11-26T20:02:06.940Z
lastmod: 2023-11-27T00:00:00.000Z
categories:
  - webdev
tags:
  - hugo
  - tinacms
---

I've spent a lot of time weighing options of different technologies to build my blog with. These days there are so many options it can get pretty overwhelming. You have hundreds of different languages, frameworks and hosting providers and trying to choose the *best* one is pretty much impossible.

I've stumbled upon a few different technologies which satisfy my needs and wants for my blogging setup.

The source code for this blog is available on [my github](https://github.com/Blquinn/hugoblog).

## Hugo

[Hugo](https://gohugo.io/) is a static site generator, which essentially takes a bunch of markdown files and templates them to create your website. It sources your web pages from files that are committed to a git repository. It does a lot more than that, if you want to learn more about Hugo, just take a look at their site.

### TinaCMS

[Tina](https://tina.io/) is a CMS that can work with a bunch of different backends for content management. One of those backends that it is compatible with is Hugo. They offer a cloud solution so you can edit your posts from their website and it will automatically commit your changes to your git repo, which will then show up on your site.

I'm not really using Tina to it's full potential, rather I'm just running it locally and using it to edit my posts.

I get a couple of nifty benefits from this setup:

* A rich text editor to edit my markdown files
* A validated form to edit the markdown files' frontmatter metadata
* Automated workflow around creation of and updates to posts

I'll explain more about all of this later on in this post.

### AWS S3 & Cloudfront

Hugo outputs a bunch of static, rendered html files, css and javascript files (I'm not actually using any javascript on this site) and those files then need to be hosted somewhere. You can use any hosting service, cloud provider, self host, whatever to host this. I'm using S3 to store and serve the files and I use Cloudfront as the CDN, which also gives me TLS. I pretty much just chose this setup because I'm familiar with it and it's got a good free tier. I don't pay anything to host this site. Finally I did setup CodeBuild to build my site (it just runs the `hugo` command), however it broke at some point and I don't really care enough to get it working again. Now I just build it locally on my laptop.

## How It's Done

These are the steps that I took to create the site.

### 1. Create Hugo Site

Follow the steps on [Hugo's Quick Start guide](https://gohugo.io/getting-started/quick-start/) to set up your Hugo site.

### 2. Setup TinaCMS

Initialize TinaCMS using the command npx @tinacms/cli\@latest init.

### 3. Add Dev Script

Update your package.json to include a development script for TinaCMS:

```json
{
  "scripts": {
    "dev": "tinacms dev -c \"hugo server -D\""
  }
}
```

### 4. Configure Tina

We need to configure Tina to work together with hugo, let's see how to do that.

First we need to tell tina where our content is located, so we will create a posts collection:

```javascript
schema: {
  collections: [
    {
      name: "post",
      label: "Posts",
      path: "content/posts",
    ...
```

This tells Tina where our markdown content is located.

Then, we want to add a field for each metadata field that hugo wants:

```javascript
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
  ...
```

Essentially, what we're doing here is configuring a form for tina to display. The name of each field corresponds to the field that is actually stored in the markdown files' frontmatter.

Next, I update the filename.slugify function to make URL slugs look how I want them.

```javascript
filename: {
  slugify: (values) => slugify(values.title, { lower: true }),
```

I'm using the [slugify ](https://www.npmjs.com/package/slugify)library, which has a better slug function than I feel like writing.

After that we configure a tina hook called beforeSubmit to add create and update timestamps to the pages:

```javascript
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
```

The fields lastmod and date are hugo frontmatter fields for the last modified time and the creation date respectively.

## Wrapping Up

After everything is done the tina admin console looks like this:

![Tina admin console screenshot](/tina-admin-console-screenshot.png "Tina admin console screenshot")

Here's a better shot of the rich text editor:![Screenshot of the rich text editor](/tina-admin-console-screenshot-2.png "Here's a better shot of the rich text editor")

This combination of Hugo and Tina has made it really nice to author blog posts, not to mention it's all free. It could just be the motivation that I need to actually start writing some posts.
