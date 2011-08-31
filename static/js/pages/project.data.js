var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_data = {
    /**
     * Function: getNeedDetails
     * Fetch the detail for a given need_id
     */
    getNeedDetails: function(need_id, success, error) {
        tc.jQ.ajax({
            url:'/rest/v1/needs/' + need_id + '/',
            dataType:'json',
            success:function(data, status, xhr) {
                if (success) {
                    success(data, status, xhr);
                }
            },
            error:function(xhr, status, errorThrown){
                if (error) {
                    error(xhr, status, errorThrown);
                }
            }
        });
    },
    createNeed: function(need_data, success, error) {
      tc.jQ.ajax({
        type:'POST',
        url:'/rest/v1/needs/',
        data:need_data,
        dataType:'text',
        success:function(data, status, xhr) {
          if (success) {
            success(data, status, xhr);
          }
        },
        error:function(xhr, status, errorThrown){
          if (error) {
            error(xhr, status, errorThrown);
          }
        }
      });
    },
    updateNeed: function(need_id, need_data, success, error) {
      tc.jQ.ajax({
        type:'PUT',
        url:'/rest/v1/needs/' + need_id + '/',
        data:need_data,
        dataType:'text',
        success:function(data, status, xhr) {
          if (success) {
            success(data, status, xhr);
          }
        },
        error:function(xhr, status, errorThrown){
          if (error) {
            error(xhr, status, errorThrown);
          }
        }
      });
    }
};

