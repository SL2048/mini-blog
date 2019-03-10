import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdate = new Subject<{posts: Post [], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams)
    .pipe(
      map(
        (postData) => {
          return {
            posts: postData.posts.map( post => {
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
        }
      )
    )
    .subscribe(
      (transformedPosts) => {
        console.log(transformedPosts);
        this.posts = transformedPosts.posts;
        this.postsUpdate.next({
          posts: [...this.posts],
          postCount: transformedPosts.maxPosts
        });
      }
    );
  }

  getPostUpdateListener() {
    return this.postsUpdate.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      creator: string}>
      (BACKEND_URL + id);
  }

  addPost(newPostTitle: string, newPostContent: string, image: File) {
    const postData = new FormData();
    postData.append('title', newPostTitle);
    postData.append('content', newPostContent);
    postData.append('image', image, newPostTitle);
    this.http.post<{message: string, post: Post}>(BACKEND_URL, postData).subscribe(
      responseData => {
        this.router.navigate(['/']);
      }
    );
  }

  updatePost(postId: string, postTitle: string, postContent: string, image: File | string) {
    let postData: FormData | Post;
    if ( typeof(image) === 'object' ) {
      postData = new FormData();
      postData.append('id', postId);
      postData.append('title', postTitle);
      postData.append('content', postContent);
      postData.append('image', image, postTitle);
    } else {
      postData = {
        id: postId,
        title: postTitle,
        content: postContent,
        imagePath: image,
        creator: null
      };
    }

    this.http.put(BACKEND_URL + postId, postData)
      .subscribe(
        response => {
          this.router.navigate(['/']);
        }
      );

  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }
}
