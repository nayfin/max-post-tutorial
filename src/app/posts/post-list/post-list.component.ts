import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   { title: "First Post", content: "This is the first post's content" },
  //   { title: "Second Post", content: "This is the second post's content" },
  //   { title: "Third Post", content: "This is the third post's content" }
  // ];
  posts: Post[] = [];
  totalPosts = 0;
  isLoading = true;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 25];

  loggedIn = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.subscriptions.push(
      this.postsService.getPostUpdateListener()
        .subscribe((postData: {posts: Post[], maxPosts: number}) => {
          this.posts = postData.posts;
          this.totalPosts = postData.maxPosts;
          this.isLoading = false;
        }),
      this.authService.user$.subscribe( user => this.loggedIn = !!user )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach( sub => sub.unsubscribe() );
  }

  onChangedPage(event: PageEvent) {
    console.log('pageChaned', event);
    this.isLoading = true;
    this.currentPage = event.pageIndex + 1;
    this.postsPerPage = event.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);

  }
  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId)
      .subscribe( (res) => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      });
  }
}
