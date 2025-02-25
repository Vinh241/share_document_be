import { Request, Response, NextFunction } from "express";
import db from "../database/connection";
import { GetDocumentsQuery, PaginatedResponse } from "../types";

export const getDocuments = async (
  req: Request<{}, {}, {}, GetDocumentsQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
      status,
      categoryId,
      subjectId,
      universityId,
      search,
    } = req.query;

    // Build base query
    const baseQuery = db("documents")
      .select(
        "documents.document_id",
        "documents.title",
        "documents.description",
        "documents.price",
        "documents.file_path",
        "documents.instruct_path",
        "documents.view_count",
        "documents.download_count",
        "documents.status",
        "documents.created_at",
        "documents.updated_at",
        "users.username as author",
        "categories.name as category_name",
        "subjects.name as subject_name",
        "universities.name as university_name"
      )
      .leftJoin("users", "documents.user_id", "users.user_id")
      .leftJoin("categories", "documents.category_id", "categories.category_id")
      .leftJoin("subjects", "documents.subject_id", "subjects.subject_id")
      .leftJoin(
        "universities",
        "documents.university_id",
        "universities.university_id"
      );

    // Apply filters
    if (status) {
      baseQuery.where("documents.status", status);
    }
    if (categoryId) {
      baseQuery.where("documents.category_id", categoryId);
    }
    if (subjectId) {
      baseQuery.where("documents.subject_id", subjectId);
    }
    if (universityId) {
      baseQuery.where("documents.university_id", universityId);
    }
    if (search) {
      baseQuery.whereRaw("LOWER(documents.title) LIKE LOWER(?)", [`%${search}%`]);
    }

    // Get total count using a separate simple count query
    const countQuery = db("documents")
      .count("document_id as total")
      .modify((qb) => {
        if (status) qb.where("status", status);
        if (categoryId) qb.where("category_id", categoryId);
        if (subjectId) qb.where("subject_id", subjectId);
        if (universityId) qb.where("university_id", universityId);
        if (search) qb.whereRaw("LOWER(title) LIKE LOWER(?)", [`%${search}%`]);
      });

    const [count] = await countQuery;
    const total = Number(count.total);

    // Get paginated data
    const documents = await baseQuery
      .orderBy(sortBy, sortOrder)
      .offset((page - 1) * limit)
      .limit(limit);

    const response: PaginatedResponse<any> = {
      data: documents,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };

    res.json({
      status: "success",
      ...response,
    });
  } catch (error) {
    next(error);
  }
};
