import { Request, Response } from "express";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { authenticateUser, AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import { ApiResponse, CreateReviewRequest, UpdateReviewRequest } from "@/types";
import {
  validateCreateReview,
  validateUpdateReview,
} from "@/validators/reviews";

// GET /reviews - Get all reviews
export const getAllReviews = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Fetching reviews...");

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
      *,
      movie:movie_id(id, title, director, release_date, poster_url)
    `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Reviews fetch error:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      throw HttpError("Failed to fetch reviews", 500);
    }

    const response: ApiResponse<any[]> = {
      success: true,
      data: reviews,
    };

    res.json(response);
  }
);

// GET /reviews/me - Get current user's reviews
export const getMyReviews = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
      *,
      movie:movie_id(id, title, release_date, poster_url)
    `
      )
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw HttpError("Failed to fetch your reviews", 500);
    }

    const response: ApiResponse<any[]> = {
      success: true,
      data: reviews,
    };

    res.json(response);
  }
);

// POST /reviews - Create review
export const createReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    console.log("Creating review...");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user?.id);

    const body: CreateReviewRequest = validateCreateReview(req.body);
    const { movie_id, rating, title, comment } = body;

    // Check if movie exists
    const { data: movie } = await supabase
      .from("movies")
      .select("id")
      .eq("id", movie_id)
      .single();

    if (!movie) {
      throw HttpError("Movie not found", 404);
    }

    // Check if user already reviewed this movie
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", req.user!.id)
      .eq("movie_id", movie_id)
      .single();

    if (existingReview) {
      throw HttpError("You have already reviewed this movie", 400);
    }

    // Create Supabase client with user's JWT token for RLS
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Create review
    const { data: review, error } = await userSupabase
      .from("reviews")
      .insert([
        {
          user_id: req.user!.id,
          movie_id,
          rating,
          title,
          comment,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.log("Review creation error:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      throw HttpError("Failed to create review", 500);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: review,
      message: "Review created successfully",
    };

    res.status(201).json(response);
  }
);

// GET /reviews/:id - Get review by ID
export const getReviewById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data: review, error } = await supabase
      .from("reviews")
      .select(
        `
      *,
      user:user_id(id, email),
      movie:movie_id(id, title, release_date, poster_url)
    `
      )
      .eq("id", id)
      .single();

    if (error || !review) {
      throw HttpError("Review not found", 404);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: review,
    };

    res.json(response);
  }
);

// PATCH /reviews/:id - Update review
export const updateReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const body: UpdateReviewRequest = validateUpdateReview(req.body);

    // Check if review exists and user owns it
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingReview) {
      throw HttpError(
        "Review not found or you do not have permission to edit it",
        404
      );
    }

    if (existingReview.user_id !== req.user!.id) {
      throw HttpError(
        "Review not found or you do not have permission to edit it",
        404
      );
    }

    // Create Supabase client with user's JWT token for RLS
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Update review
    const { data: review, error } = await userSupabase
      .from("reviews")
      .update(body)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw HttpError("Failed to update review", 500);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: review,
      message: "Review updated successfully",
    };

    res.json(response);
  }
);

// DELETE /reviews/:id - Delete review
export const deleteReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Check if review exists and user owns it
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingReview) {
      throw HttpError(
        "Review not found or you do not have permission to delete it",
        404
      );
    }

    if (existingReview.user_id !== req.user!.id) {
      throw HttpError(
        "Review not found or you do not have permission to delete it",
        404
      );
    }

    // Create Supabase client with user's JWT token for RLS
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Delete review
    const { error } = await userSupabase.from("reviews").delete().eq("id", id);

    if (error) {
      throw HttpError("Failed to delete review", 500);
    }

    const response: ApiResponse = {
      success: true,
      message: "Review deleted successfully",
    };

    res.json(response);
  }
);
