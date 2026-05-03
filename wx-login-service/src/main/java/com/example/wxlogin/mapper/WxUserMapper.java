package com.example.wxlogin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.wxlogin.entity.WxUser;
import org.apache.ibatis.annotations.Mapper;

/**
 * 微信用户 Mapper 接口
 * 继承 MyBatis-Plus BaseMapper，获得基本的 CRUD 操作
 */
@Mapper
public interface WxUserMapper extends BaseMapper<WxUser> {

}
