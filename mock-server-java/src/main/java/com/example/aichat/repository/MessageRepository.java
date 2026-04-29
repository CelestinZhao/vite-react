package com.example.aichat.repository;

import com.example.aichat.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    /** 会话全部消息（升序） */
    List<Message> findByConversationIdOrderByCreateTimeAsc(String conversationId);

    /** 会话最近 N 条（非空内容），用于构造上下文 */
    @Query("""
            SELECT m FROM Message m
            WHERE m.conversationId = :cid AND m.content <> ''
            ORDER BY m.createTime DESC
            """)
    List<Message> findRecent(@Param("cid") String conversationId, Pageable pageable);

    /** 级联删除会话下的全部消息 */
    @Modifying
    @Query("DELETE FROM Message m WHERE m.conversationId = :cid")
    int deleteByConversationId(@Param("cid") String conversationId);
}
