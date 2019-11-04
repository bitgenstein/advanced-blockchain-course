#include <eosio/eosio.hpp>
#include <eosio/system.hpp>

using namespace eosio;

CONTRACT mailinglist4 : public contract {

  private:

    TABLE mailinglist {
        name username;
        auto primary_key() const { return username.value; }
    };
    typedef eosio::multi_index<name("mailinglist"), mailinglist> mailinglist_table;

    mailinglist_table _mailinglist;

    void add_user(name username);
    void delete_user(name username);

  public:
    using contract::contract;

    ACTION regusr(name username);
    ACTION unregusr(name username);

    mailinglist4(name receiver, name code, datastream<const char*> ds):
        contract(receiver, code, ds),
        _mailinglist(receiver, receiver.value) {}
};
