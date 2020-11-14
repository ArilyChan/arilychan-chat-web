<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters(['user', 'session'])
  },
  filters: {
    // 将日期过滤为 hour:minutes
    time (date) {
      if (typeof date === 'string') {
        date = new Date(date)
      }
      return date.getHours() + ':' + date.getMinutes()
    }
  }
}
</script>

<template>
<div class="message" v-scroll-bottom="session.messages">
    <ul v-if="session">
        <li v-for="(item,index) in session.messages" :key="index">
            <p class="time" v-if="index === 0">
                <span>{{ item.date | time }}</span>
            </p>
            <p class="time" v-else-if="new Date(item.date).getMinutes() > new Date(session.messages[index - 1].date).getMinutes()">
                <span>{{ item.date | time }}</span>
            </p>
            <div class="main" :class="{ self: item.self }">
                <img class="avatar" width="30" height="30" :src="item.self ? user.img : session.user.img" />
                <div style="display: flex; flex-direction: column; flex-grow: 0">
                    <span v-if="!item.self"><small>{{item.user.name || item.user.id }}</small></span>
                    <div class="text" style="width: fit-content">
                        <p v-for="(line,index) of item.content.split('\n')" :key="index" style="line-height: 1.2">
                            {{line}}
                        </p>
                    </div>
                </div>
            </div>
        </li>
    </ul>
</div>
</template>

<style lang="less" scoped>
.message {
    padding: 10px 15px;
    overflow-y: scroll;

    li {
        margin-bottom: 15px;
    }
    .time {
        margin: 7px 0;
        text-align: center;

        > span {
            display: inline-block;
            padding: 0 18px;
            font-size: 12px;
            color: #fff;
            border-radius: 2px;
            background-color: #dcdcdc;
        }
    }
    .avatar {
        float: left;
        margin: 0 10px 0 0;
        border-radius: 3px;
    }
    .text {
        display: inline-block;
        position: relative;
        padding: 0 10px;
        max-width: ~'calc(100% - 40px)';
        min-height: 30px;
        line-height: 2.5;
        font-size: 12px;
        text-align: left;
        word-break: break-all;
        background-color: #fafafa;
        border-radius: 4px;

        &:before {
            content: " ";
            position: absolute;
            top: 9px;
            right: 100%;
            border: 6px solid transparent;
            border-right-color: #fafafa;
        }
    }

    .self {
        // text-align: right;

        .avatar {
            float: right;
            margin: 0 0 0 10px;
        }
        .text {
            align-self: flex-end;
            background-color: #b2e281;

            &:before {
                right: inherit;
                left: 100%;
                border-right-color: transparent;
                border-left-color: #b2e281;
            }
        }
    }
}
</style>
