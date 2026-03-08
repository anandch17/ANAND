import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-error',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-body">
      <div class="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 max-w-lg w-full text-center">
        <!-- Top gradient bar -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-rose-600 rounded-t-3xl"></div>

        <!-- Icon -->
        <div class="w-20 h-20 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <!-- Error code -->
        <p class="text-[11px] font-black uppercase tracking-[0.15em] text-rose-400 mb-2">Error {{ code }}</p>

        <!-- Title -->
        <h1 class="text-2xl font-display font-bold text-slate-900 mb-3">{{ title }}</h1>

        <!-- Message -->
        <p class="text-slate-500 font-medium text-[15px] mb-8 leading-relaxed">{{ message }}</p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button (click)="goBack()"
            class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
            Go Back
          </button>
          <a routerLink="/"
            class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 shadow-lg shadow-sky-600/20 transition-all text-center">
            Home
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ErrorPageComponent {
    code: number | string = 500;
    title = 'Something went wrong';
    message = 'An unexpected error occurred. Please try again.';

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    constructor() {
        const state = this.router.getCurrentNavigation()?.extras?.state;
        //console.log(state);
        if (state) {
            this.code = state['code'] ?? this.code;
            this.title = state['title'] ?? this.title;
            this.message = state['message'] ?? this.message;
            
        } else {
            // fallback from query params
            this.route.queryParams.subscribe(params => {
                if (params['code']) this.code = params['code'];
                if (params['message']) this.message = params['message'];
                if (params['title']) this.title = params['title'];
                console.log(this.code);
            });
        }
    }

    goBack() { history.back(); }
}

// Need to import inject:
import { inject } from '@angular/core';
