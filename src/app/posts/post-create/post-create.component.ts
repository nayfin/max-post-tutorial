import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { mimeType } from './mime-type.validator'
import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  isLoading = false;

  imagePreview = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png';

  private mode = 'create';
  private postId: string;
  private subscriptions: Subscription[] = [];

  private postForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public postsService: PostsService,
    public route: ActivatedRoute,
    public router: Router,
  ) {}

  ngOnInit() {
    this.postForm = this.createPostForm();

    this.route.paramMap.subscribe( (paramMap: ParamMap ) => {
      this.mode = paramMap.has('postId') ? 'edit' : 'create';
      if  (this.mode === 'edit') {
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.subscriptions.push(
          this.postsService.getPost(this.postId).subscribe( (post: Post) => {
            this.isLoading = false;
            this.postForm.patchValue({
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              image: post.imagePath,
            });
            if (post.imagePath) {
              this.imagePreview = post.imagePath;
            }
          })
        );
      }
    });

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( subscription => subscription.unsubscribe() );
  }

  createPostForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required ],
      content: ['', Validators.required ],
      image: [ null, [Validators.required], mimeType ],
    });
  }

  onImagePicked(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.postForm.get('image').setValue(file);
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSubmit( ) {
    if (this.postForm.invalid) {
      return;
    }
    if (this.mode === 'edit') {
      this.onUpdatePost();
    } else {
      this.onAddPost();
    }
  }

  onUpdatePost() {
    this.subscriptions.push(
      this.postsService.updatePost(
        this.postId,
        this.postForm.value.title,
        this.postForm.value.content,
        this.postForm.value.image
      ).subscribe( response => {
        this.postForm.reset();
        this.router.navigate(['']);
      }),
    );
  }

  onAddPost() {
    this.postsService.addPost(this.postForm.value.title, this.postForm.value.content, this.postForm.value.image).subscribe( response => {
      this.postForm.reset();
      this.router.navigate(['']);
    });
  }
}
