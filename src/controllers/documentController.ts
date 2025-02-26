import { Request, Response, NextFunction } from "express";
import db from "../database/connection";
import { GetDocumentsQuery, PaginatedResponse } from "../types";
import { AppError } from "../middleware/errorHandler";

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

    // Get total count using a separate simple count query
    const countQuery = db("documents")
      .count("document_id as total")
      .modify((qb) => {
        if (status) qb.where("status", status);
        if (categoryId) qb.where("category_id", categoryId);
        if (subjectId) qb.where("subject_id", subjectId);
        if (universityId) qb.where("university_id", universityId);
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


//createDocument
export const createDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {  
  try {
    const {
      title,
      description,
      price,
      file_path,
      instruct_path,
      user_id,
      category_id,
      subject_id,
      university_id,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!title || !price || !file_path) {
      return res.status(400).json({ status: "error", message: "Thiếu thông tin bắt buộc" });
    }

    // 🔍 Kiểm tra xem title đã tồn tại chưa
    const existingDocument = await db("documents").where({ title }).first();
    if (existingDocument) {
      return res.status(400).json({ status: "error", message: "Tiêu đề đã tồn tại" });
    }

    // Chèn dữ liệu vào database
    const [newDocument] = await db("documents")
      .insert({
        title,
        description,
        price,
        file_path,
        instruct_path,
        user_id,
        category_id,
        subject_id,
        university_id,
        view_count: 0,
        download_count: 0,
        status: "active",
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning("*");

    return res.status(201).json({
      status: "success",
      data: newDocument,
    });
  } catch (error) {
    next(error);
    return;
  }
};



//updateDocument
export const updateDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.query; // Lấy id từ query params
    if (!id) {
      throw new AppError("Missing document ID", 400);
    }

    // Check if document exists
    const existingDocument = await db("documents")
      .where("document_id", id)
      .first();

    if (!existingDocument) {
      throw new AppError("Document not found", 404);
    }

    const updateData = req.body;
    if (Object.keys(updateData).length === 0) {
      throw new AppError("No data provided for update", 400);
    }

    updateData.updated_at = new Date(); // Add updated_at timestamp

    await db("documents").where("document_id", id).update(updateData);
    const updatedDocument = await db("documents").where("document_id", id).first();
    
    res.json({ status: "success", data: updatedDocument });
  } catch (error) {
    next(error);
  }
};

//deleteDocument
export const deleteDocument = async (
  req: Request<{}, {}, {}, { id: number }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.query; // Lấy ID từ query string

    if (!id) {
      throw new AppError("Document ID is required", 400);
    }

    // Kiểm tra xem document có tồn tại không
    const document = await db("documents").where("document_id", id).first();

    if (!document) {
      throw new AppError("Document not found", 404);
    }

    // Thực hiện xóa mềm (cập nhật status thành 'pending')
    await db("documents").where("document_id", id).update({
      status: "pending",
      updated_at: new Date(), // Cập nhật timestamp hiện tại
    });

    res.json({
      status: "success",
      message: `Document ${id} has been set to pending.`,
    });
  } catch (error) {
    next(error);
  }
};

//getDocumentById
export const getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { document_id } = req.body; // Nhận document_id từ JSON body

    if (!document_id) {
      return res.status(400).json({ message: "document_id là bắt buộc trong body" });
    }

    const document = await db("documents")
      .where({ document_id })
      .first();

    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    return res.status(200).json({ status: "success", data: document }); // Luôn có return
  } catch (error) {
    console.error("Lỗi truy vấn getDocumentById:", error);
    return next(error); // Đảm bảo return trong catch
  }
};

