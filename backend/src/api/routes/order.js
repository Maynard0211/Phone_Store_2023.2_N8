import express from "express";
import responseError from "../res/response.js";
import { callRes } from "../res/response.js";

// Import database connection
import connection from "../../db/connect.js";

const router = express.Router();

router.get("/get/:id", (req, res) => {
  const orderId = req.params.id;

  connection.query(
    "SELECT * FROM orders WHERE id = ?",
    [orderId],
    (error, orderResults) => {
      if (error) {
        console.error("Lỗi truy vấn cơ sở dữ liệu: ", error);
        res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
        return;
      }

      if (orderResults.length === 0) {
        res.status(404).json({ error: "Không tìm thấy hóa đơn bán" });
      } else {
        const order = orderResults[0];
        connection.query("SELECT op.*, p.name AS productName FROM orderedproduct sp JOIN product p ON op.productId = p.id WHERE orderId = ?",
          // "SELECT * FROM orderedproduct WHERE orderId = ?aaa",
          [orderId],
          (error, orderedProductResults) => {
            if (error) {
              console.error("Lỗi truy vấn cơ sở dữ liệu: ", error);
              res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
              return;
            }
            console.log(query);
            order.orderedProduct = orderedProductResults;
            console.log(orderedProductResults);
            console.log(orderResults);
            res.json(order);
          }
        );
      }
    }
  );
});

// API DELETE: Xóa hóa đơn bán theo ID
router.delete("/delete/:id", (req, res) => {
  const orderId = req.params.id;

  connection.query(
    "DELETE FROM orderedproduct WHERE orderId = ?",
    [orderId],
    (error, deleteOrderedProductResults) => {
      if (error) {
        console.error("Lỗi truy vấn cơ sở dữ liệu: ", error);
        res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
        return;
      }

      connection.query(
        "DELETE FROM orders WHERE id = ?",
        [orderId],
        (error, deleteOrderResults) => {
          if (error) {
            console.error("Lỗi truy vấn cơ sở dữ liệu: ", error);
            res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
            return;
          }

          if (deleteOrderResults.affectedRows === 0) {
            res.status(404).json({ error: "Không tìm thấy hóa đơn bán" });
          } else {
            res.json({ message: "Xóa hóa đơn bán thành công" });
          }
        }
      );
    }
  );
});

// API POST: Thêm hóa đơn bán mới

router.get("/get", (req, res) => {
  connection.query("SELECT * FROM orders", (error, orderResults) => {
    if (error) {
      console.error("Lỗi truy vấn cơ sở dữ liệu: ", error);
      res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
      return;
    }

    const promises = orderResults.map((order) => {
      return new Promise((resolve, reject) => {
        connection.query(
          "SELECT * FROM orderedproduct WHERE orderId = ?",
          [order.id],
          (error, orderedProductResults) => {
            if (error) {
              console.error("Lỗi truy vấn cơ sở dữ liệu: ", error);
              reject(error);
            } else {
              order.orderedProduct = orderedProductResults;
              resolve(order);
            }
          }
        );
      });
    });

    Promise.all(promises)
      .then((orderWithProducts) => {
        res.json(orderWithProducts);
      })
      .catch((error) => {
        console.error("Lỗi truy vấn cơ sở dữ liệu: ", error);
        res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
      });
  });
});

router.post("/add", (req, res) => {
  const {
    customerName,
    phone,
    address,
    date,
    warranty,
    description,
  } = req.body;
  const query =
    "INSERT INTO orders (customerName, phone, address, date, warranty, description) VALUES (?, ?, ?, ?, ?, ?)";

  connection.query(
    query,
    [customerName, phone, address, date, warranty, description],
    (error, insertOrderResults) => {
      if (error) {
        console.log(insertOrderResults);
        console.error("Lỗi truy vấn cơ sở dữ liệu: ", error);
        res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
        return;
      }

      const orderId = insertOrderResults.insertId;
      const orderedProductValues = orderedProduct.map((item) => [
        orderId,
        item.productId,
        item.quantity,
        item.price,
        item.quantity * item.price,
      ]);

      connection.query(
        "INSERT INTO orderedproduct (orderId, productId, quantity, price, total) VALUES ?",
        [orderedProductValues],
        (error, insertOrderedProductResults) => {
          if (error) {
            console.error("Lỗi truy vấn cơ sở dữ liệu: ", error);
            res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
            return;
          }

          // Cập nhật trường 'sold' và giảm trường 'quantity' trong bảng 'product'
          const updateProductQuery =
            "UPDATE product SET sold = sold + ?, quantity = quantity - ? WHERE id = ?";
          orderedProduct.forEach((item) => {
            console.log(item);
            connection.query(
              updateProductQuery,
              [item.quantity, item.quantity, item.productId],
              (error) => {
                if (error) {
                  console.error("Lỗi truy vấn cơ sở dữ liệu: ", error);
                  res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
                  return;
                }
              }
            );
          });

          res.json({ message: "Thêm hóa đơn bán thành công" });
        }
      );
    }
  );
});

export { router };
