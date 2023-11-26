---
draft: false
title: GraphQL is an Anti-Pattern
date: 2021-04-09T17:22:04.000Z
lastmod: 2023-11-26T00:00:00.000Z
tags:
  - microservices
  - graphql
  - webdev
---

We've been using graphql at work and I find it so tiresome that I was motivated to write a blog post about it!

Here are some of the top reasons why I really don't like graphql.

## Invented at Facebook

I mean... I assume it somehow is collecting all of our users' data.

*Just kidding, onto the real stuff.*

## It's a micro-services destroyer

We use a fairly standard micro-services pattern at my company. This means that we get to benefit from the productivity gains from having separate code bases on each team.

By having a single service that houses routes to all of our other services, we create a central point of contention, where all of our teams need to coordinate releases. This directly conflicts with the main purpose of micro-services, which is to decrease friction between teams during the development process.

I know there are some fixes for this, like schema stitching and apollo federation, but neither is without their issues. They both also require a single point of contention to house the schema. Federation is only available with apollo right now, so if you're using any other graphql server, you're out of luck.

## The static typing concept is barely beneficial

We use golang on our backend and typescript on our frontend, so in that sense, our rest apis are already statically typed. I really only think this point is relevant if you're using dynamic languages on both the frontend and backend.

In the end, if you're using a dynamic language on the client side, static typing on the server is not super helpful.

## Questionable performance claims

With the advent and prevalence of HTTP2, the claims about performance of graphql are mostly false. Since HTTP2 pipelines requests, the only real difference in performance is the difference between the size of the additional http headers in the case of HTTP2 and the graphql query for graphql.

In the case of mutations, I have never seen mutations called in parallel.

The only case that can really improve performance is nested data structures that rely on previous calls, so calls that need to be run sequentially on the backend. This case is actually pretty rare, requires a large development effort to implement and still barely helps when you consider the performance drawbacks below. Is maintaining an entire graphql API actually less work than creating a couple ad-hoc endpoints that join together some responses and send them in a single larger response? I would argue that it is not.

There are actually many *drawbacks* performance wise with graphql. For one, you cannot use HTTP caches, or caching at the edge with graphql. For many companies, including ours, in order to fulfill performance requirements, especially with respect to performance spikes, we have to cache at the edge in our CDN.

Secondly, the graphql servers are a bottleneck across the whole company's infrastructure. You typically will pipe all of your requests through a single cluster of servers. While you are free to create a multi-az deployment of your graphql servers, this takes work and starts to decrease the benefits of the round-trip reduction that we wanted in the first place.

Most graphql servers use node, so we're replacing reverse proxies, which generally perform as well as their network connections will allow, with slow, garbage collected application servers. Maybe if you wrote your graphql servers in rust, or c++ you could actually find a way of making graphql development take longer.

To sum this up, you'd have to do a whole lot of performance testing to validate any performance claims because the performance implications are hazy at best.

## It's not a replacement for good documentation.

It seems like one of the things that the front end devs like most about graphql is it's ability to generate documentation.

There are plenty of tools to accomplish this with much less hassle, such as Swagger.

Swagger and OpenAPI also bring the code generation benefits that many people use graphql for.

Secondly, API docs are just one piece, you typically need to document many other aspects of the project for it to be usable by a front end team.

## It's a time suck

This point seems to fly in the face of their claim that "the best thing about graphql is increased developer productivity". Why does the consensus at our company seem to be that graphql is a time suck, when clearly they're stating that it increases developer productivity?

Graphql adds overhead to every API that is added to the project. Changes that are made to the underlying rest apis must be added to the graphql api as well.

I would estimate that I probably spend an additional 5-25% of time just adding my changes to our graphql API. This does not account for the fact that I typically need to wait for several other teams to deploy their stuff ahead of me due to the aforementioned process bottlenecks.

Finally, it's just another thing to learn, which should require a good justification, preferably something more than just amorphous claims about productivity and performance.

## It's another thing that can break

Putting an additional layer, which is not just configuration, but full blown code between the server and the client adds another thing that can easily break.

You need to actually map the responses from backend APIs to graphql. So the responsibility of mapping responses based on status codes is just shifted from frontend to backend, but isn't eliminated.

Futhermore, we need to actually write tests for graphql now. This piece seems to mysteriously go missing for most of our apis.

Finally, I've found lots of business logic sneaking into our graphql layer. This is not a good thing for something that is supposed to be basically a routing layer to our existing backend services.

### Parting words

A lot of the things discussed in this article are likely issues due to our particular implementation of graphql. That said, it's really not clear what the right way of doing things is. There simply aren't solutions for most of the problems that we're facing.

Personally, I think it's just a buzzword that's going to fade away in the next few years and I will not shed a tear when it does.
