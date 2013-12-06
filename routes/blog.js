var prismic = require('../prismic-helpers'),
    _ = require('underscore');

// -- Categories

var categories = [
  "Announcements", 
  "Do it yourself", 
  "Behind the scenes"
];

// -- Index

exports.posts = prismic.route(function(req, res, ctx) {

  var category = req.params['category'];

  var searchForm = ctx.api.form('blog').ref(ctx.ref);

  if (category) searchForm.query('[[:d = at(my.blog-post.category, "' + category + '")]]');

  searchForm.submit(function(posts) {

    res.render('posts', {
      posts: posts,
      categories: categories
    });

  });

});

// -- Post detail

exports.postDetail = prismic.route(function(req, res, ctx) {

  var id = req.params['id'],
      slug = req.params['slug'];

  prismic.getDocument(ctx, id, slug, function(post) {

    // Retrieve the related products
    prismic.getDocuments(ctx,

      // Get all related product ids
      _.chain(post.getAll('blog-post.relatedproduct').map(function(link) {
        if(link.document.type == "product" && !link.isBroken) {
          return link.document.id;
        }
      }).filter(function(link) { return link; })).value(), 

      // Then
      function(relatedProducts) {

        // Retrieve the related posts
        prismic.getDocuments(ctx,

          // Get all related product ids
          _.chain(post.getAll('blog-post.relatedpost').map(function(link) {
            if(link.document.type == "blog-post" && !link.isBroken) {
              return link.document.id;
            }
          }).filter(function(link) { return link; })).value(), 

          // Then
          function(relatedPosts) {

            res.render('postDetail', {
              post: post,
              relatedProducts: relatedProducts,
              relatedPosts: relatedPosts,
              categories: categories
            });           

          }

        );

      }

    );

  });

});