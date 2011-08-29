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
            error:function(xhr, status, error){
                if (error) {
                    error(xhr, status, error);
                }
            }
        });
    }
};

