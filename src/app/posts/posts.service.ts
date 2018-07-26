import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Post } from './post.model';
import { HttpClient } from '@angular/common/http';

const postBaseUrl = 'http://localhost:3000/api/posts';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], maxPosts: number}>();

  constructor( private http: HttpClient ) {}

  getPosts(postPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postPerPage}&currentPage=${currentPage}`;
    this.http.get<{message: string, posts: any[], maxPosts: number}>(`${postBaseUrl}${queryParams}`)
      .pipe(
        map( (postData) => {
          return {
            posts: postData.posts.map( (post) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe( transformedPostData  => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({posts: [...this.posts], maxPosts: transformedPostData.maxPosts});
      });
  }

  getPost(id: string) {
    return this.http.get<{ _id: string; title: string; content: string, imagePath: string }>(`${postBaseUrl}/${id}`).pipe(
      map( (postResponse: { message: string, post: any }) => {
        const mappedPost = { ...postResponse.post, id: postResponse.post._id };
        return mappedPost;
      })
    );
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  deletePost(postId: string) {
    return this.http.delete(`${postBaseUrl}/${postId}`);
      // .subscribe( (res) => {
      //   this.posts = this.posts.filter( post => post.id !== postId );
      //   this.postsUpdated.next({posts: [...this.posts], maxPosts: transformedPostDat);
      // });
  }


  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image);
    return this.http.post<{message: string, post: Post}>(postBaseUrl, postData)
      // .pipe(
      //   tap( (response ) => {
      //     const post: Post = {
      //       id: response.post.id,
      //       title: title,
      //       content: content,
      //       imagePath: response.post.imagePath,
      //     };
      //     this.posts.push( post );
      //     this.postsUpdated.next([...this.posts]);
      //   })
      // );
  }

  updatePost( id: string, title: string, content: string, image: File | string ) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    if (typeof image === 'object') {
      postData.append('image', image, title );
    } else {
      postData.append('image', image);
    }
    //  id, title, content, imagePath: null };
    console.log('updating post', postData);
    return this.http.put<{message: string, post: Post}>(`${postBaseUrl}/${id}`, postData )
      .pipe(
        tap( (response) => {
          console.log('update postData', postData.get('title') );
          console.log('update response', response);
          const posts = this.posts.map( ( val, i, arr ) => {
            return val.id === id ? response.post : val;
           });
          //  this.postsUpdated.next([...posts]);
        }),
      );
  }


}
