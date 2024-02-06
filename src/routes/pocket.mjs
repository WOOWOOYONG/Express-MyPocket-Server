import express from 'express';
import Pocket from '../models/pocketModel.mjs';
import verifyToken from '../middlewares/auth.mjs';

const router = express.Router();

// 取得所有的pocket資料
router.get('/api/pockets', verifyToken, async (req, res) => {
  console.log('取得Pocket資料');
  try {
    const myPockets = await Pocket.find({ userId: req.user.id }, { __v: 0 });
    return res.json({
      msg: '取得所有pocket資料成功',
      data: myPockets,
      ok: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err.message, ok: false });
  }
});

// 新增一個pocket item
router.post('/api/pocket', verifyToken, async (req, res) => {
  console.log('新增Pocket');
  const pocket = new Pocket({
    ...req.body,
    userId: req.user.id,
  });

  try {
    const newPocket = await pocket.save();
    return res.status(201).json({ msg: '新增pocket成功', newPocket, ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: err.message, ok: false });
  }
});

// 刪除一個pocket item
router.delete('/api/pocket/:id', verifyToken, async (req, res) => {
  console.log('刪除Pocket');
  try {
    const result = await Pocket.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ msg: '找不到資料', ok: false });
    }
    return res.status(200).json({ msg: '刪除pocket成功', ok: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err.message, ok: false });
  }
});

// 編輯一個pocket item
router.patch('/api/pocket/:id', verifyToken, async (req, res) => {
  console.log('編輯Pocket');
  try {
    const foundPocket = await Pocket.findById(req.params.id);
    if (!foundPocket) {
      return res.status(404).json({ msg: '找不到資料', ok: false });
    }

    // 更新pocket的資料
    Object.entries(req.body).forEach(([key, value]) => {
      foundPocket[key] = value;
    });

    await foundPocket.save();
    return res.status(200).json({ msg: '編輯成功', foundPocket, ok: true });
  } catch (err) {
    return res.status(400).json({ msg: err.message, ok: false });
  }
});

// 更新指定Pocket的status
router.patch('/api/pocket/status/:id', verifyToken, async (req, res) => {
  console.log('更新Pocket狀態');
  const pocketId = req.params.id;

  try {
    const foundPocket = await Pocket.findById(pocketId);
    if (!foundPocket) {
      return res.status(404).json({ msg: '找不到資料', ok: false });
    }

    foundPocket.status = !foundPocket.status;
    await foundPocket.save();

    return res.json({ msg: '更新成功', foundPocket, ok: true });
  } catch (err) {
    return res.status(500).json({ msg: err.message, ok: false });
  }
});

// 更新指定Pocket的collect
router.patch('/api/pocket/collect/:id', verifyToken, async (req, res) => {
  console.log('更新Pocket收藏');
  const pocketId = req.params.id;

  try {
    const foundPocket = await Pocket.findById(pocketId);
    if (!foundPocket) {
      return res.status(404).json({ msg: '找不到資料', ok: false });
    }

    foundPocket.collect = !foundPocket.collect;
    await foundPocket.save();

    return res.json({ msg: '更新成功', foundPocket, ok: true });
  } catch (err) {
    return res.status(500).json({ msg: err.message, ok: false });
  }
});

// 取得使用者收藏的所有pocket
router.get('/api/pockets/collected', verifyToken, async (req, res) => {
  console.log('取得收藏的Pocket');
  try {
    const collectedPockets = await Pocket.find({
      userId: req.id,
      collect: true,
    });
    if (collectedPockets.length === 0) {
      return res.status(200).json({ msg: '沒有找到任何收藏', ok: true });
    }
    res
      .status(200)
      .json({ msg: '取得收藏成功', data: collectedPockets, ok: true });
  } catch (err) {
    res.status(500).json({ msg: err.message, ok: false });
  }
});

export default router;
