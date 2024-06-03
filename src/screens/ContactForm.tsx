/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useContext, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import HeaderWithNav from '../common/HeaderWithNav';
import { AccountContext } from '../AccountContext';

type EditFormInput = {
  name: string;
  address: string;
};

const ContactForm: FC = () => {
  const { accessService, addressBook } = useContext(AccountContext);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors }
  } = useForm<EditFormInput>();
  const { id } = useParams();
  const navigate = useNavigate();

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
          {
            errors.name &&
            <p className="text-sm text-red-400">
              {errors.name.message}
            </p>
          }
        </div>
        <div className="mb-3">
          <label htmlFor="address">
            Recipient Address
          </label>
          <input
            id="address"
            {...register('address', {
              required: 'This field is required',
              pattern: {
                value: /^(tb1|bcrt1|bc1)[a-zA-HJ-NP-Z0-9]{8,87}$/,
                message: "Invalid Taproot address",
              },
            })}
          />
          {
            errors.address &&
            <p className="text-sm text-red-400">
              {errors.address.message}
            </p>
          }
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
