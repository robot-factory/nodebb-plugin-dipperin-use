<div>
  <h1>您的Dipperin账户</h1>
  <input type="text" name="dipperin-account" id="dipperin-address"/>
  <button id="dipperin-settings">保存</button>
  <script>
    function dipperinSet () {
      const data = {
        account: '0x'
      }
      socket.emit('dipperin:account.myMethod', data, function (err, data) {
        if (err) {
          console.log('dipperin:account.myMethod error:',err)
        }
        console.log('dipperin:account.myMethod data:', data)
      })
    }

    socket.on('dipperin:account.myMethod',function (data) {
      console.log('on dipperin:account.myMethod data:', data)
    })

    $('#dipperin-settings').on('click', dipperinSet)

  </script>
</div>