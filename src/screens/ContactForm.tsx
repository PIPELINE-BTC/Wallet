// /* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as bitcoin from 'bitcoinjs-lib';
import { validateBitcoinAddress } from '../bitcoin/utils';
import { AccountContext } from '../AccountContext';
import HeaderWithNav from '../common/HeaderWithNav';

type EditFormInput = {
  name: string;
  address: string;
};

const ContactForm = () => {
  const { accessService, addressBook, network } = useContext(AccountContext);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors }
  } = useForm<EditFormInput>();
  const { id } = useParams();
  const navigate = useNavigate();

  const currentNetwork = network === 'livenet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

  const onSubmit: SubmitHandler<EditFormInput> = (data) => {
    if (id) {
      accessService.store.editContact(id, data);
    } else {
      accessService.store.addContact(data);
    }
    navigate("/contacts");
  };

  useEffect(() => {
    if (id) {
      const contact = addressBook.find((c: any) => c.id === id);
      if (contact) {
        setValue("name", contact.name);
        setValue("address", contact.address);
      }
    }
  }, [id, setValue, addressBook]);

  return (
    <>
      <HeaderWithNav title={id ? "Edit Contact" : "Create Contact"} />
      <form
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        className="p-6"
      >
        <div className="mb-3">
          <label htmlFor="name">
            Recipient Name
          </label>
          <input
            id="name"
            {...register('name', { required: 'This field is required' })}
          />
          {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
        </div>
        <div className="mb-3">
          <label htmlFor="address">
            Recipient Address
          </label>
          <input
            id="address"
            {...register('address', {
              required: 'This field is required',
              validate: (value) => {
                const isValid = validateBitcoinAddress(value, currentNetwork);
                if (!isValid) {
                  return 'Invalid Bitcoin address';
                }
                return true;
              }
            })}
          />
          {errors.address && <p className="text-sm text-red-400">{errors.address.message}</p>}
        </div>
        <div className="absolute bottom-0 left-0 w-full">
          <button
            className="btn btn-primary w-full text-black"
            type="submit"
          >
            {id ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </>
  );
};

export default ContactForm;
