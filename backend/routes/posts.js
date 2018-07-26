const express = require('express');
const multer = require('multer');

const Post = require('../models/post')
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg'
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('invalid mime type');
    cb(error, 'backend/images',);
  },
  filename: ( req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    console.log('')
    cb(null, `${name}-${Date.now()}.${ext}`)
  }
});

router.post('', 
  checkAuth,
  multer({storage: storage}).single('image'), 
  ( req, res, next) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: `${baseUrl}/images/${req.file.filename}`,
    creator: req.userData._id,
  });

  post.save().then( createdPost => {
    res.status(201).json({
      message: 'Post added successfully',
      post: {
        ...createdPost,
        id: createdPost._id,
        creator: createdPost.creator,
      },
      postId: createdPost._id,
    });
  })
})

router.put('/:id',
  checkAuth,
  multer({storage: storage}).single('image'),
  ( req, res, next) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imagePath = req.file ? `${baseUrl}/images/${req.file.filename}` : req.body.imagePath;
  const post = new Post ({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
  });
  Post.updateOne({_id: req.params.id, creator: req.userData._id }, post  )
    .then( (result) => {
      console.log('put result', result);
      if( result.nModified > 0) {
        res.status(200).json( { 
          message: 'update successfull',
          post: { ...post, id: post._id }
        })
      } else {
        res.status(401).json( { 
          message: 'Not authorized',
        })
      }
    })
})

router.get('/:id', (req, res, next) => { 
  
  Post.findById(req.params.id)
    .then( (post) => {
      if(!post) {
        res.status(404).json({message: 'post not found'})
      }
      res.status(200).json({
        message: 'Posts sent!!',
        post: post,
      })
    });
});

router.get('', (req, res, next) => { 
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.currentPage;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage -1 ))
      .limit(pageSize);
  }
  postQuery
    .then( (posts) => {
      fetchedPosts = posts;
      return Post.count();
    }).then(count => {
      res.status(200).json({
        message: 'Posts sent!!',
        posts: fetchedPosts,
        maxPosts: count,
      })
    });
});

router.delete('/:id', 
  checkAuth,
  (req, res, next) => {
  const postId = req.params.id
  Post.deleteOne({ _id: postId, creator: req.userData._id })
    .catch( console.error )
    .then( result => {
      if( result.n > 0) {
        res.status(200).json( { 
          message: 'delete successfull',
        })
      } else {
        res.status(401).json( { 
          message: 'Not authorized',
        })
      }
    });
});

module.exports = router;